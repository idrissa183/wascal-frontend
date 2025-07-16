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
import { CheckCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export const ForgotPasswordPage: React.FC = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { requestPasswordReset, isLoading, error, clearError } = useAuthStore();
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = useForm<RequestPasswordResetFormData>({
    resolver: zodResolver(requestPasswordResetSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: RequestPasswordResetFormData) => {
    clearError();
    try {
      await requestPasswordReset(data.email);
      setIsEmailSent(true);
    } catch (error) {
      // L'erreur est déjà gérée dans le store
    }
  };

  const handleBackToLogin = () => {
    window.location.href = "/auth/login";
  };

  if (isEmailSent) {
    return (
      <AuthLayout
        title={t.auth?.email_sent_title || "Email envoyé"}
        subtitle={t.auth?.check_email || "Vérifiez votre boîte de réception"}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.auth?.password_reset_sent ||
                "Un lien de réinitialisation a été envoyé à"}{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {getValues("email")}
              </span>
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t.auth?.email_not_received ||
                "Vous ne recevez pas l'email ? Vérifiez vos spams ou ressayez."}
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleBackToLogin}
              variant="outline"
              className="w-full"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t.auth?.back_to_login || "Retour à la connexion"}
            </Button>

            <Button
              onClick={() => setIsEmailSent(false)}
              variant="ghost"
              className="w-full"
            >
              {t.auth?.try_another_email || "Essayer avec un autre email"}
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t.auth?.forgot_password_title || "Mot de passe oublié"}
      subtitle={
        t.auth?.forgot_password_subtitle ||
        "Entrez votre email pour recevoir un lien de réinitialisation"
      }
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive" onClose={clearError}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
      </div>
    </AuthLayout>
  );
};
