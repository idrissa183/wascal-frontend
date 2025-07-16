// src/components/auth/SocialAuth.tsx
import React, { useState } from "react";
import { Button } from "../ui/Button";
import { useTranslations } from "../../hooks/useTranslations";
import { authService } from "../../services/auth.service";
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

      const authUrl = await authService.initiateOAuthLogin(provider);

      if (authUrl) {
        // Rediriger vers l'URL d'authentification OAuth
        window.location.href = authUrl;
      } else {
        throw new Error(`Failed to get ${provider} authentication URL`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `${provider} authentication failed`;

      setError(errorMessage);
      onError?.(errorMessage);
      console.error(`${provider} OAuth error:`, error);
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
    </div>
  );
};
