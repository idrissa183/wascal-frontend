import { AuthGuard } from "../middleware/auth";
import {
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
  GUEST_ONLY_ROUTES,
} from "../constants";

/**
 * Initialise la protection des routes globalement
 */
export class RouteProtection {
  private static instance: RouteProtection;
  private authGuard: AuthGuard;
  private isInitialized = false;

  private constructor() {
    this.authGuard = AuthGuard.getInstance();
  }

  static getInstance(): RouteProtection {
    if (!RouteProtection.instance) {
      RouteProtection.instance = new RouteProtection();
    }
    return RouteProtection.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.authGuard.initialize();
      this.setupRouteProtection();
      this.isInitialized = true;
    } catch (error) {
      console.error("Route protection initialization failed:", error);
      throw error;
    }
  }

  private setupRouteProtection(): void {
    // Intercepter les changements de route (pour les SPA)
    this.handleCurrentRoute();

    // Écouter les changements d'historique
    window.addEventListener("popstate", () => {
      this.handleCurrentRoute();
    });

    // Intercepter les clics sur les liens
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a[href]") as HTMLAnchorElement;

      if (link && this.isInternalLink(link.href)) {
        const path = new URL(link.href).pathname;
        this.checkRouteAccess(path);
      }
    });
  }

  private async handleCurrentRoute(): Promise<void> {
    const currentPath = window.location.pathname;
    await this.checkRouteAccess(currentPath);
  }

  private async checkRouteAccess(path: string): Promise<void> {
    try {
      // Vérifier si c'est une route protégée
      if (this.isProtectedRoute(path)) {
        const hasAccess = await this.authGuard.requireAuth();
        if (!hasAccess) {
          return; // L'utilisateur sera redirigé automatiquement
        }
      }

      // Vérifier si c'est une route réservée aux invités
      if (this.isGuestOnlyRoute(path)) {
        if (this.authGuard.isAuthenticated()) {
          this.redirectToDashboard();
        }
      }
    } catch (error) {
      console.error("Route access check failed:", error);
      // En cas d'erreur, rediriger vers la page de connexion pour les routes protégées
      if (this.isProtectedRoute(path)) {
        this.redirectToLogin();
      }
    }
  }

  private isProtectedRoute(path: string): boolean {
    return PROTECTED_ROUTES.some((route) => {
      if (route.endsWith("*")) {
        const basePath = route.slice(0, -1);
        return path.startsWith(basePath);
      }
      return path === route;
    });
  }

  private isGuestOnlyRoute(path: string): boolean {
    return GUEST_ONLY_ROUTES.some((route) => {
      if (route.endsWith("*")) {
        const basePath = route.slice(0, -1);
        return path.startsWith(basePath);
      }
      return path === route;
    });
  }

  private isPublicRoute(path: string): boolean {
    return PUBLIC_ROUTES.some((route) => {
      if (route.endsWith("*")) {
        const basePath = route.slice(0, -1);
        return path.startsWith(basePath);
      }
      return path === route;
    });
  }

  private isInternalLink(href: string): boolean {
    try {
      const url = new URL(href);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  private redirectToLogin(): void {
    const currentPath = window.location.pathname;
    const returnUrl = !this.isPublicRoute(currentPath)
      ? `?returnUrl=${encodeURIComponent(currentPath)}`
      : "";
    window.location.href = `/auth/login${returnUrl}`;
  }

  private redirectToDashboard(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get("returnUrl");

    if (returnUrl && !this.isGuestOnlyRoute(returnUrl)) {
      window.location.href = returnUrl;
    } else {
      window.location.href = "/dashboard";
    }
  }
}

// Script global à inclure dans toutes les pages
export const initGlobalRouteProtection = async (): Promise<void> => {
  try {
    const routeProtection = RouteProtection.getInstance();
    await routeProtection.initialize();
  } catch (error) {
    console.error("Failed to initialize route protection:", error);
  }
};

// Hook pour vérifier l'accès à une route spécifique
export const useRouteAccess = () => {
  const routeProtection = RouteProtection.getInstance();
  const authGuard = AuthGuard.getInstance();

  return {
    checkAccess: (path: string) => routeProtection.checkRouteAccess(path),
    isAuthenticated: () => authGuard.isAuthenticated(),
    requireAuth: () => authGuard.requireAuth(),
    requireGuest: () => authGuard.requireGuest(),
  };
};
