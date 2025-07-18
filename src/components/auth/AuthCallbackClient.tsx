import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTranslations } from "../../hooks/useTranslations";
import { AuthLayout } from "./AuthLayout";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { getApiBaseUrl } from "../../constants"; // Import ajouté

export const AuthCallbackClient: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const { setUser, setLoading } = useAuthStore();
  const t = useTranslations();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        setStatus("loading");
        setLoading(true);

        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("access_token");
        const refreshToken = urlParams.get("refresh_token");
        const userId = urlParams.get("user_id");
        const error = urlParams.get("error");
        const provider = window.location.pathname.split("/").pop(); // google ou github

        // console.log("OAuth callback parameters:", {
        //   accessToken: accessToken ? "present" : "missing",
        //   refreshToken: refreshToken ? "present" : "missing",
        //   userId,
        //   error,
        //   provider,
        // });

        // Vérifier s'il y a une erreur OAuth
        if (error) {
          let errorMessage = "Erreur d'authentification OAuth";

          switch (error) {
            case "oauth_error":
              errorMessage = `Erreur lors de l'authentification avec ${provider}`;
              break;
            case "invalid_state":
              errorMessage = "Session d'authentification invalide ou expirée";
              break;
            case "oauth_failed":
              errorMessage = `Impossible de récupérer les informations de ${provider}`;
              break;
            default:
              errorMessage = `Erreur OAuth: ${error}`;
          }

          throw new Error(errorMessage);
        }

        // Vérifier la présence des tokens
        if (!accessToken || !refreshToken) {
          throw new Error("Tokens d'authentification manquants");
        }

        // Stocker les tokens
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        // Récupérer l'URL de base de l'API correctement
        const apiBaseUrl = getApiBaseUrl();
        // console.log("Using API Base URL:", apiBaseUrl); // Debug log

        // Récupérer les informations utilisateur avec le token
        const response = await fetch(
          `${apiBaseUrl}/api/auth/me`, // Utilisation de getApiBaseUrl()
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // console.log("User info response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.detail ||
              "Impossible de récupérer les informations utilisateur"
          );
        }

        const userData = await response.json();
        // console.log("User data received:", userData);

        // Mettre à jour le store
        setUser(userData);
        setStatus("success");

        // Rediriger vers le dashboard après un court délai
        setTimeout(() => {
          // Nettoyer l'URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          // Rediriger vers le dashboard
          const returnUrl =
            sessionStorage.getItem("oauth_return_url") || "/dashboard";
          sessionStorage.removeItem("oauth_return_url");
          window.location.href = returnUrl;
        }, 2000);
      } catch (error) {
        // console.error("OAuth callback error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Erreur d'authentification OAuth"
        );
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [setUser, setLoading]);

  const handleRetryLogin = () => {
    // Nettoyer les tokens en cas d'erreur
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("oauth_return_url");

    window.location.href = "/auth/login";
  };

  const handleGoToDashboard = () => {
    window.location.href = "/dashboard";
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center space-y-6">
            <LoadingSpinner size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t.auth?.processing_login || "Traitement de la connexion..."}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.auth?.please_wait ||
                  "Veuillez patienter pendant que nous vous connectons."}
              </p>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t.auth?.login_success || "Connexion réussie !"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.auth?.redirecting || "Redirection en cours..."}
              </p>
            </div>
            <Button onClick={handleGoToDashboard} className="w-full">
              {t.auth?.go_to_dashboard}
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {t.auth?.login_failed || "Échec de la connexion"}
              </h3>
            </div>

            <Alert variant="destructive">
              {error ||
                t.auth?.oauth_error ||
                "Erreur lors de l'authentification OAuth"}
            </Alert>

            <div className="space-y-3">
              <Button onClick={handleRetryLogin} className="w-full">
                {t.auth?.back_to_login || "Retour à la connexion"}
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="w-full"
              >
               {t.auth?.back_to_home}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title={
        status === "success"
          ? t.auth?.login_success || "Connexion réussie"
          : status === "error"
          ? t.auth?.login_failed || "Échec de la connexion"
          : t.auth?.login_title || "Connexion en cours"
      }
    >
      {renderContent()}
    </AuthLayout>
  );
};
