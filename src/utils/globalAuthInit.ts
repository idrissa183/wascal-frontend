import { authService } from "../services/auth.service";
import { useAuthStore } from "../stores/useAuthStore";
import { initGlobalRouteProtection } from "./routeProtection";

/**
 * Initialise l'authentification globalement pour l'application
 */
export class GlobalAuthManager {
  private static instance: GlobalAuthManager;
  private isInitialized = false;
  private authStore: any;

  private constructor() {
    // Récupérer le store auth
    this.authStore = useAuthStore.getState();
  }

  static getInstance(): GlobalAuthManager {
    if (!GlobalAuthManager.instance) {
      GlobalAuthManager.instance = new GlobalAuthManager();
    }
    return GlobalAuthManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log("Initializing global authentication...");

      // 1. Vérifier s'il y a un utilisateur stocké localement
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        this.authStore.setUser(storedUser);
      }

      // 2. Si l'utilisateur est supposé être connecté, vérifier le token
      if (authService.isAuthenticated()) {
        await this.validateCurrentSession();
      }

      // 3. Initialiser la protection des routes
      await initGlobalRouteProtection();

      // 4. Configurer les intercepteurs automatiques
      this.setupTokenRefreshInterceptor();
      this.setupStorageListener();

      this.isInitialized = true;
      console.log("Global authentication initialized successfully");
    } catch (error) {
      console.error("Failed to initialize global authentication:", error);
      // En cas d'erreur, nettoyer les données d'auth
      await this.clearAuthData();
    }
  }

  private async validateCurrentSession(): Promise<void> {
    try {
      // Vérifier si le token est expiré
      if (authService.isTokenExpired()) {
        try {
          // Tenter de rafraîchir le token
          await authService.refreshToken();
        } catch (refreshError) {
          console.warn("Token refresh failed, clearing auth data");
          await this.clearAuthData();
          return;
        }
      }

      // Récupérer les données utilisateur actuelles
      const user = await authService.getCurrentUser();
      if (user) {
        this.authStore.setUser(user);
      } else {
        await this.clearAuthData();
      }
    } catch (error) {
      console.error("Session validation failed:", error);
      await this.clearAuthData();
    }
  }

  private setupTokenRefreshInterceptor(): void {
    // Intercepter les requêtes pour rafraîchir automatiquement le token
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        // Assurer que le token est valide avant la requête
        const token = await authService.ensureValidToken();

        if (token && init?.headers) {
          const headers = new Headers(init.headers);
          headers.set("Authorization", `Bearer ${token}`);
          init.headers = headers;
        }

        const response = await originalFetch(input, init);

        // Si 401, essayer de rafraîchir le token une fois
        if (response.status === 401 && authService.isAuthenticated()) {
          try {
            const newToken = await authService.refreshToken();
            if (newToken && init?.headers) {
              const headers = new Headers(init.headers);
              headers.set("Authorization", `Bearer ${newToken}`);
              init.headers = headers;

              // Retry la requête avec le nouveau token
              return await originalFetch(input, init);
            }
          } catch (refreshError) {
            console.warn("Token refresh failed during request intercept");
            await this.clearAuthData();
          }
        }

        return response;
      } catch (error) {
        console.error("Request interceptor error:", error);
        return originalFetch(input, init);
      }
    };
  }

  private setupStorageListener(): void {
    // Écouter les changements de localStorage pour synchroniser entre onglets
    window.addEventListener("storage", (event) => {
      if (event.key === "access_token") {
        if (!event.newValue) {
          // Token supprimé dans un autre onglet
          this.authStore.setUser(null);
          this.authStore.setLoading(false);
        }
      }
    });
  }

  private async clearAuthData(): Promise<void> {
    await authService.logout();
    this.authStore.setUser(null);
    this.authStore.setLoading(false);
    this.authStore.clearError();
  }

  // Méthodes utilitaires publiques
  isAuthenticated(): boolean {
    return authService.isAuthenticated() && !authService.isTokenExpired();
  }

  async logout(): Promise<void> {
    await this.clearAuthData();
    window.location.href = "/auth/login";
  }

  getCurrentUser() {
    return this.authStore.user;
  }
}

// Script à inclure dans le layout principal
export const initGlobalAuth = async (): Promise<void> => {
  try {
    const authManager = GlobalAuthManager.getInstance();
    await authManager.initialize();
  } catch (error) {
    console.error("Failed to initialize global auth:", error);
  }
};

// Hook pour accéder au gestionnaire d'auth global
export const useGlobalAuth = () => {
  const authManager = GlobalAuthManager.getInstance();

  return {
    isAuthenticated: () => authManager.isAuthenticated(),
    logout: () => authManager.logout(),
    getCurrentUser: () => authManager.getCurrentUser(),
  };
};
