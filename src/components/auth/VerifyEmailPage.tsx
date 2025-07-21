import React, { useEffect, useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { useTranslations } from "../../hooks/useTranslations";
import { authService } from "../../services/auth.service";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface VerifyEmailPageProps {
  token?: string; // Token peut être passé en prop ou récupéré depuis l'URL
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({
  token: propToken,
}) => {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "resending"
  >("loading");
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const t = useTranslations();

  useEffect(() => {
    const verifyEmail = async () => {
      // Récupérer le token depuis les props ou l'URL
      const token =
        propToken ||
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("token")
          : null);

      if (!token) {
        setStatus("error");
        setError(
          t.auth?.verify_email_error || "Token de vérification manquant"
        );
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus("success");
      } catch (error) {
        console.error("Email verification failed:", error);
        setStatus("error");
        setError(
          error instanceof Error
            ? error.message
            : t.auth?.verify_email_error || "La vérification a échoué"
        );
      }
    };

    verifyEmail();
  }, [propToken, t.auth]);

  const handleResendVerification = async () => {
    if (!email) {
      setError(
        t.validation?.email_required || "Veuillez entrer votre adresse email"
      );
      return;
    }

    setStatus("resending");
    setError(null);

    try {
      // Ici vous devriez avoir une méthode pour renvoyer l'email de vérification
      // await authService.resendVerificationEmail(email);

      // Pour l'instant, simuler le succès
      setTimeout(() => {
        setStatus("success");
      }, 2000);
    } catch (error) {
      setStatus("error");
      setError(
        error instanceof Error
          ? error.message
          : t.auth?.resend_verification_failed ||
              "Échec de l'envoi de l'email de vérification"
      );
    }
  };

  const handleGoToLogin = () => {
    window.location.href = "/auth/login";
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center space-y-6">
            <LoadingSpinner size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t.auth?.verify_email_subtitle ||
                  "Vérification de votre adresse email en cours"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.auth?.please_wait || "Veuillez patienter..."}
              </p>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t.auth?.verify_email_success || "Email vérifié avec succès !"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.auth?.account_activated_message ||
                  "Votre compte est maintenant activé. Vous pouvez vous connecter."}{" "}
              </p>
            </div>
            <Button onClick={handleGoToLogin} className="w-full">
              {t.auth?.go_to_login || "Aller à la connexion"}
            </Button>
          </div>
        );

      case "error":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                {t.auth?.verify_email_error || "Vérification échouée"}
              </h3>
            </div>

            {error && <Alert variant="destructive">{error}</Alert>}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  {t.email || "Email"}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder || "votre@email.com"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <Button
                onClick={handleResendVerification}
                disabled={!email.trim()}
                className="w-full"
              >
                {t.auth?.resend_verification ||
                  "Renvoyer le lien de vérification"}
              </Button>

              <Button
                variant="outline"
                onClick={handleGoToLogin}
                className="w-full"
              >
                {t.auth?.back_to_login || "Retour à la connexion"}
              </Button>
            </div>
          </div>
        );

      case "resending":
        return (
          <div className="text-center space-y-6">
            <LoadingSpinner size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t.auth?.sending || "Envoi en cours..."}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.auth?.sending_new_verification ||
                  "Envoi d'un nouveau lien de vérification..."}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title={t.auth?.verify_email_title || "Vérification de l'email"}
      subtitle={
        status === "success"
          ? t.auth?.account_activated || "Compte activé avec succès"
          : status === "error"
          ? t.auth?.verification_problem || "Problème de vérification"
          : t.auth?.verification_in_progress || "Vérification en cours..."
      }
    >
      {renderContent()}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
