// src/middleware/auth.ts
import { authService } from "../services/auth.service";

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
        const user = await authService.getCurrentUser();
        if (!user) {
          // Token invalide, rediriger vers login
          this.redirectToLogin();
        }
      }
      this.isInitialized = true;
    } catch (error) {
      console.error("Auth initialization error:", error);
      this.redirectToLogin();
    }
  }

  isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }

  requireAuth(): void {
    if (!this.isAuthenticated()) {
      this.redirectToLogin();
    }
  }

  requireGuest(): void {
    if (this.isAuthenticated()) {
      this.redirectToDashboard();
    }
  }

  private redirectToLogin(): void {
    const currentPath = window.location.pathname;
    const returnUrl =
      currentPath !== "/auth/login"
        ? `?returnUrl=${encodeURIComponent(currentPath)}`
        : "";
    window.location.href = `/auth/login${returnUrl}`;
  }

  private redirectToDashboard(): void {
    window.location.href = "/dashboard";
  }
}

// Hook pour utiliser l'AuthGuard dans les composants React
export const useAuthGuard = () => {
  const authGuard = AuthGuard.getInstance();

  return {
    isAuthenticated: authGuard.isAuthenticated(),
    requireAuth: () => authGuard.requireAuth(),
    requireGuest: () => authGuard.requireGuest(),
  };
};

// Script à inclure dans les pages protégées
export const initAuthGuard = () => {
  const authGuard = AuthGuard.getInstance();
  authGuard.initialize();
  return authGuard;
};

// Utilitaire pour les pages qui nécessitent une authentification
export const requireAuth = () => {
  const authGuard = AuthGuard.getInstance();
  authGuard.requireAuth();
};

// Utilitaire pour les pages qui nécessitent d'être déconnecté (login, register)
export const requireGuest = () => {
  const authGuard = AuthGuard.getInstance();
  authGuard.requireGuest();
};
