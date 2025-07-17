// src/components/auth/SocialAuth.tsx - Version corrigée
import React, { useState } from "react";
import { Button } from "../ui/Button";
import { useTranslations } from "../../hooks/useTranslations";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";

interface SocialAuthProps {
  mode?: "login" | "register";
  onError?: (error: string) => void;
}

export const SocialAuth: React.FC<SocialAuthProps> = ({
  mode = "login",
  onError,
}) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setLoadingProvider(provider);
      setError(null);

      // Sauvegarder l'URL de retour
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== "/auth/login" && currentUrl !== "/auth/register") {
        sessionStorage.setItem("oauth_return_url", currentUrl);
      }

      // Appeler l'API backend pour obtenir l'URL d'autorisation
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/oauth/${provider}/login`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            `Erreur lors de l'initiation de l'authentification ${provider}`
        );
      }

      const data = await response.json();

      if (!data.auth_url) {
        throw new Error(`URL d'authentification ${provider} non disponible`);
      }

      // Rediriger vers l'URL d'autorisation OAuth
      window.location.href = data.auth_url;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Erreur d'authentification ${provider}`;

      console.error(`${provider} OAuth error:`, error);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoadingProvider(null);
    }
  };

  const isRegisterMode = mode === "register";

  const getButtonText = (provider: "google" | "github") => {
    if (isRegisterMode) {
      return provider === "google"
        ? t.auth?.oauth?.signup_with_google || "S'inscrire avec Google"
        : t.auth?.oauth?.signup_with_github || "S'inscrire avec GitHub";
    } else {
      return provider === "google"
        ? t.auth?.oauth?.login_with_google || "Se connecter avec Google"
        : t.auth?.oauth?.login_with_github || "Se connecter avec GitHub";
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => handleOAuthLogin("google")}
        disabled={loadingProvider !== null}
        className="w-full"
      >
        {loadingProvider === "google" ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          <FcGoogle className="h-5 w-5 mr-2" />
        )}
        {getButtonText("google")}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => handleOAuthLogin("github")}
        disabled={loadingProvider !== null}
        className="w-full"
      >
        {loadingProvider === "github" ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          <FaGithub className="h-5 w-5 mr-2" />
        )}
        {getButtonText("github")}
      </Button>

      {/* Instructions pour l'utilisateur */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          En vous connectant, vous acceptez nos{" "}
          <a href="/terms" className="text-primary-600 hover:text-primary-500">
            conditions d'utilisation
          </a>{" "}
          et notre{" "}
          <a
            href="/privacy"
            className="text-primary-600 hover:text-primary-500"
          >
            politique de confidentialité
          </a>
        </p>
      </div>
    </div>
  );
};
