// src/middleware/auth.ts
import React from "react";
import { authService } from "../services/auth.service";
import { PUBLIC_ROUTES, PROTECTED_ROUTES } from "../constants";

export class AuthGuard {
  private static instance: AuthGuard;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AuthGuard {
    if (!AuthGuard.instance) {
      AuthGuard.instance = new AuthGuard();
    }
    return AuthGuard.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Vérifier si l'utilisateur est connecté
      if (authService.isAuthenticated()) {
        // Vérifier que le token est encore valide
        const user = await authService.getCurrentUser();
        if (!user) {
          // Token invalide, nettoyer et rediriger si nécessaire
          await authService.logout();
        }
      }
      this.isInitialized = true;
    } catch (error) {
      console.error("Auth initialization error:", error);
      await authService.logout();
    }
  }

  isAuthenticated(): boolean {
    return authService.isAuthenticated() && !authService.isTokenExpired();
  }

  async requireAuth(): Promise<boolean> {
    // Vérifier d'abord l'état local
    if (!authService.isAuthenticated()) {
      this.redirectToLogin();
      return false;
    }

    // Vérifier si le token est expiré
    if (authService.isTokenExpired()) {
      try {
        // Tenter de rafraîchir le token
        await authService.refreshToken();
        return true;
      } catch {
        // Échec du rafraîchissement, déconnecter
        await authService.logout();
        this.redirectToLogin();
        return false;
      }
    }

    return true;
  }

  requireGuest(): void {
    if (this.isAuthenticated()) {
      this.redirectToDashboard();
    }
  }

  // Vérifier si une route est publique
  isPublicRoute(path: string): boolean {
    return PUBLIC_ROUTES.some((route) => {
      if (route.endsWith("*")) {
        // Route avec wildcard (ex: /auth/*)
        const basePath = route.slice(0, -1);
        return path.startsWith(basePath);
      }
      return path === route || path.startsWith(route + "/");
    });
  }

  // Vérifier si une route est protégée
  isProtectedRoute(path: string): boolean {
    return PROTECTED_ROUTES.some((route) => {
      if (route.endsWith("*")) {
        const basePath = route.slice(0, -1);
        return path.startsWith(basePath);
      }
      return path === route || path.startsWith(route + "/");
    });
  }

  private redirectToLogin(): void {
    const currentPath = window.location.pathname;
    const returnUrl = !this.isPublicRoute(currentPath)
      ? `?returnUrl=${encodeURIComponent(currentPath)}`
      : "";
    window.location.href = `/auth/login${returnUrl}`;
  }

  private redirectToDashboard(): void {
    // Récupérer l'URL de retour depuis les paramètres
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get("returnUrl");

    if (returnUrl && !this.isPublicRoute(returnUrl)) {
      window.location.href = returnUrl;
    } else {
      window.location.href = "/dashboard";
    }
  }

  // Méthode pour vérifier les permissions pour des routes spécifiques
  async checkRouteAccess(path: string): Promise<boolean> {
    // Si c'est une route publique, autoriser l'accès
    if (this.isPublicRoute(path)) {
      return true;
    }

    // Si c'est une route protégée, vérifier l'authentification
    if (this.isProtectedRoute(path)) {
      return await this.requireAuth();
    }

    // Route non définie, par défaut autoriser
    return true;
  }
}

// Hook pour utiliser l'AuthGuard dans les composants React
export const useAuthGuard = () => {
  const authGuard = AuthGuard.getInstance();

  return {
    isAuthenticated: authGuard.isAuthenticated(),
    requireAuth: () => authGuard.requireAuth(),
    requireGuest: () => authGuard.requireGuest(),
    checkRouteAccess: (path: string) => authGuard.checkRouteAccess(path),
    isPublicRoute: (path: string) => authGuard.isPublicRoute(path),
    isProtectedRoute: (path: string) => authGuard.isProtectedRoute(path),
  };
};

// Script à inclure dans les pages protégées
export const initAuthGuard = async () => {
  const authGuard = AuthGuard.getInstance();
  await authGuard.initialize();
  return authGuard;
};

// Utilitaire pour les pages qui nécessitent une authentification
export const requireAuth = async () => {
  const authGuard = AuthGuard.getInstance();
  return await authGuard.requireAuth();
};

// Utilitaire pour les pages qui nécessitent d'être déconnecté (login, register)
export const requireGuest = () => {
  const authGuard = AuthGuard.getInstance();
  authGuard.requireGuest();
};

// Component wrapper pour protéger les routes
export const withAuthGuard = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiresAuth: boolean = true
) => {
  return (props: P) => {
    const authGuard = useAuthGuard();

    React.useEffect(() => {
      if (requiresAuth) {
        authGuard.requireAuth();
      } else {
        authGuard.requireGuest();
      }
    }, []);

    // Si authentication requise mais non connecté, ne pas render
    if (requiresAuth && !authGuard.isAuthenticated) {
      return null; // ou un loading spinner
    }

    // Si guest requis mais connecté, ne pas render
    if (!requiresAuth && authGuard.isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};
