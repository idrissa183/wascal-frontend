import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "./AuthLayout";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTranslations } from "../../hooks/useTranslations";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetFormData,
} from "../../lib/validation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Alert } from "../ui/Alert";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import {
  CheckCircleIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

export const ForgotPasswordPage: React.FC = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { requestPasswordReset, isLoading, error, clearError } = useAuthStore();
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    reset,
  } = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: RequestPasswordResetFormData) => {
    clearError();
    try {
      await requestPasswordReset(data.email);
      setSubmittedEmail(data.email);
      setIsEmailSent(true);
      reset(); // Reset form
    } catch (error) {
      // L'erreur est déjà gérée dans le store
    }
  };

  const handleBackToLogin = () => {
    window.location.href = "/auth/login";
  };

  const handleTryAgain = () => {
    setIsEmailSent(false);
    setSubmittedEmail("");
    clearError();
  };

  if (isEmailSent) {
    return (
      <AuthLayout
        title={t.auth?.email_sent_title || "Email envoyé"}
        subtitle={t.auth?.check_email || "Vérifiez votre boîte de réception"}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Email envoyé avec succès !
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.auth?.password_reset_sent ||
                "Un lien de réinitialisation a été envoyé à"}{" "}
              <span className="font-medium text-gray-900 dark:text-white break-all">
                {submittedEmail}
              </span>
            </p>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
                    Instructions :
                  </p>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1">
                    <li>• Vérifiez votre boîte de réception</li>
                    <li>• Regardez dans vos spams si nécessaire</li>
                    <li>• Le lien expire dans 1 heure</li>
                    <li>• Cliquez sur le lien pour réinitialiser</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {t.auth?.email_not_received ||
                "Vous ne recevez pas l'email ? Vérifiez vos spams ou ressayez."}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleTryAgain}
              variant="outline"
              className="w-full"
            >
              Essayer avec un autre email
            </Button>

            <Button
              onClick={handleBackToLogin}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t.auth?.back_to_login || "Retour à la connexion"}
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      // title={t.auth?.forgot_password_title || "Mot de passe oublié"}
      // subtitle={
      //   t.auth?.forgot_password_subtitle ||
      //   "Entrez votre email pour recevoir un lien de réinitialisation"
      // }
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.auth?.forgot_password_title || "Mot de passe oublié"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t.auth?.forgot_password_subtitle ||
              "Entrez votre email pour recevoir un lien de réinitialisation"}{" "}
          </p>
        </div>
        {error && (
          <Alert variant="destructive" onClose={clearError}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t.email || "Email"}
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t.emailPlaceholder || "your@email.com"}
              error={errors.email?.message}
              {...register("email")}
            />
            {/* {!errors.email && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Entrez l'adresse email associée à votre compte
              </p>
            )} */}
          </div>

          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">
                  {t.auth?.sending || "Envoi en cours..."}
                </span>
              </div>
            ) : (
              t.auth?.send_reset_link || "Envoyer le lien de réinitialisation"
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 inline-flex items-center"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              {t.auth?.back_to_login || "Retour à la connexion"}
            </button>
          </div>
        </form>

        {/* Aide supplémentaire */}
        {/* <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Besoin d'aide ?
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Assurez-vous d'utiliser l'email de votre compte</li>
            <li>• Vérifiez que votre email est correctement écrit</li>
            <li>• Contactez le support si le problème persiste</li>
          </ul>
        </div> */}
      </div>
    </AuthLayout>
  );
};
