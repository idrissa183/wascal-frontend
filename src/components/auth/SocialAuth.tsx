import React, { useState } from "react";
import { Button } from "../ui/Button";
import { useTranslations } from "../../hooks/useTranslations";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebook, FaLinkedin } from "react-icons/fa";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { getApiBaseUrl } from "../../constants";

interface SocialAuthProps {
  mode?: "login" | "register";
  onError?: (error: string) => void; // Callback pour propager l'erreur vers le parent
}

export const SocialAuth: React.FC<SocialAuthProps> = ({
  mode = "login",
  onError,
}) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const t = useTranslations();

  const handleOAuthLogin = async (
    provider: "google" | "github" | "facebook" | "linkedin"
  ) => {
    try {
      setLoadingProvider(provider);

      const apiBaseUrl = getApiBaseUrl();
      // console.log("API Base URL:", apiBaseUrl); // Debug log

      // Sauvegarder l'URL de retour
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== "/auth/login" && currentUrl !== "/auth/register") {
        sessionStorage.setItem("oauth_return_url", currentUrl);
      }

      // Appeler l'API backend pour obtenir l'URL d'autorisation
      const response = await fetch(
        `${apiBaseUrl}/api/auth/oauth/${provider}/login`,
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
            t.errors.server_error ||
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
          : t.errors.unknown_error || `Erreur d'authentification ${provider}`;

      // console.error(`${provider} OAuth error:`, error);

      // Propager l'erreur vers le composant parent au lieu de l'afficher localement
      onError?.(errorMessage);
    } finally {
      setLoadingProvider(null);
    }
  };

  const isRegisterMode = mode === "register";

  const getButtonText = (
    provider: "google" | "github" | "facebook" | "linkedin"
  ) => {
    if (isRegisterMode) {
      switch (provider) {
        case "google":
          return t.auth?.oauth?.signup_with_google || "S'inscrire avec Google";
        case "github":
          return t.auth?.oauth?.signup_with_github || "S'inscrire avec GitHub";
        case "facebook":
          return (
            t.auth?.oauth?.signup_with_facebook || "S'inscrire avec Facebook"
          );
        case "linkedin":
          return (
            t.auth?.oauth?.signup_with_linkedin || "S'inscrire avec LinkedIn"
          );
        default:
          return `S'inscrire avec ${provider}`;
      }
    } else {
      switch (provider) {
        case "google":
          return t.auth?.oauth?.login_with_google || "Se connecter avec Google";
        case "github":
          return t.auth?.oauth?.login_with_github || "Se connecter avec GitHub";
        case "facebook":
          return (
            t.auth?.oauth?.login_with_facebook || "Se connecter avec Facebook"
          );
        case "linkedin":
          return (
            t.auth?.oauth?.login_with_linkedin || "Se connecter avec LinkedIn"
          );
        default:
          return `Se connecter avec ${provider}`;
      }
    }
  };

  const getProviderIcon = (
    provider: "google" | "github" | "facebook" | "linkedin"
  ) => {
    switch (provider) {
      case "google":
        return <FcGoogle className="h-5 w-5 mr-2" />;
      case "github":
        return <FaGithub className="h-5 w-5 mr-2" />;
      case "facebook":
        return <FaFacebook className="h-5 w-5 mr-2 text-blue-600" />;
      case "linkedin":
        return <FaLinkedin className="h-5 w-5 mr-2 text-blue-700" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
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
          getProviderIcon("google")
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
          getProviderIcon("github")
        )}
        {getButtonText("github")}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => handleOAuthLogin("facebook")}
        disabled={loadingProvider !== null}
        className="w-full"
      >
        {loadingProvider === "facebook" ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          getProviderIcon("facebook")
        )}
        {getButtonText("facebook")}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => handleOAuthLogin("linkedin")}
        disabled={loadingProvider !== null}
        className="w-full"
      >
        {loadingProvider === "linkedin" ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          getProviderIcon("linkedin")
        )}
        {getButtonText("linkedin")}
      </Button>

      {/* Instructions pour l'utilisateur */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t.connectingAgree}{" "}
          <a
            href="https://doc-hosting.flycricket.io/la-cause-rurale-terms-of-use/78422ce1-34a2-4405-80b7-512c558512f7/terms"
            className="text-primary-600 hover:text-primary-500"
          >
            {t.termsLink}
          </a>{" "}
          {t.andOur}{" "}
          <a
            href="https://doc-hosting.flycricket.io/la-cause-rurale-privacy-policy/d328883c-83a8-477a-a5fc-1a27aec79002/privacy"
            className="text-primary-600 hover:text-primary-500"
          >
            {t.privacyLink}
          </a>
        </p>
      </div>
    </div>
  );
};
