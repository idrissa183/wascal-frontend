import { getApiBaseUrl } from "../constants";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth";

class AuthService {
  private get baseUrl() {
    return getApiBaseUrl();
  }

  private tokenKey = "access_token";
  private refreshTokenKey = "refresh_token";
  private userKey = "user_data";

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log("Using API Base URL:", this.baseUrl); // Debug log

      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Login failed");
      }

      const data = await response.json();

      // Stocker les tokens et les données utilisateur
      this.setTokens(data.access_token, data.refresh_token);
      this.setUser(data.user);

      return {
        user: data.user,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          password: userData.password,
          phone: userData.phone || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Registration failed");
      }

      const data = await response.json();

      return {
        user: data,
        access_token: "",
        refresh_token: "",
        token_type: "bearer",
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await fetch(`${this.baseUrl}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearTokens();
      this.clearUser();
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      this.setAccessToken(data.access_token);
      if (data.user) {
        this.setUser(data.user);
      }

      return data.access_token;
    } catch (error) {
      this.clearTokens();
      this.clearUser();
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${this.baseUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré, essayer de le renouveler
          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              return this.getCurrentUser();
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            return null;
          }
        }
        throw new Error("Failed to get current user");
      }

      const userData = await response.json();
      this.setUser(userData);
      return userData;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        throw new Error("No access token");
      }

      const response = await fetch(`${this.baseUrl}/api/auth/password/change`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Password change failed");
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Password change failed"
      );
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/auth/password/reset/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Password reset request failed");
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Password reset request failed"
      );
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/auth/password/reset/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            new_password: newPassword,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Password reset failed");
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Password reset failed"
      );
    }
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify-email`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Email verification failed");
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Email verification failed"
      );
    }
  }

  // OAuth methods
  async initiateOAuthLogin(provider: "google" | "github"): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/auth/oauth/${provider}/login`
      );

      if (!response.ok) {
        throw new Error(`Failed to initiate ${provider} OAuth`);
      }

      const data = await response.json();
      return data.auth_url;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : `${provider} OAuth failed`
      );
    }
  }

  async handleOAuthCallback(
    provider: string,
    code: string,
    state?: string
  ): Promise<AuthResponse> {
    try {
      const url = new URL(
        `${this.baseUrl}/api/auth/oauth/${provider}/callback`
      );
      url.searchParams.append("code", code);
      if (state) {
        url.searchParams.append("state", state);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`OAuth callback failed for ${provider}`);
      }

      // L'API peut rediriger automatiquement ou retourner les tokens
      if (response.redirected) {
        const redirectUrl = new URL(response.url);
        const accessToken = redirectUrl.searchParams.get("access_token");
        const refreshToken = redirectUrl.searchParams.get("refresh_token");

        if (accessToken && refreshToken) {
          this.setTokens(accessToken, refreshToken);
          const user = await this.getCurrentUser();
          return {
            user: user!,
            access_token: accessToken,
            refresh_token: refreshToken,
            token_type: "bearer",
          };
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : `OAuth callback failed`
      );
    }
  }

  // Méthodes pour gérer les tokens
  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, accessToken);
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  private setAccessToken(accessToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, accessToken);
    }
  }

  private getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.refreshTokenKey);
    }
    return null;
  }

  private clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshTokenKey);
    }
  }

  // Méthodes pour gérer les données utilisateur
  private setUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  getStoredUser(): User | null {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  private clearUser(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.userKey);
    }
  }

  // Méthodes utilitaires
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Vérifier si le token est expiré
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  // Auto-refresh du token si nécessaire
  async ensureValidToken(): Promise<string | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    if (this.isTokenExpired()) {
      try {
        return await this.refreshToken();
      } catch {
        this.clearTokens();
        this.clearUser();
        return null;
      }
    }

    return this.getAccessToken();
  }
}

export const authService = new AuthService();
