import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { AuthLayout } from "./AuthLayout";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTranslations } from "../../hooks/useTranslations";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../../lib/validation";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { LoadingSpinner } from "../ui/LoadingSpinner";

export const ResetPasswordPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  const t = useTranslations();

  const token =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token") || ""
      : "";

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { token },
  });

  const watchPassword = watch("newPassword");

  // Vérifier la validité du token au chargement
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    // Pour une validation plus robuste, vous pourriez faire un appel API ici
    // Pour l'instant, on vérifie juste la présence du token
    setTokenValid(true);
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    clearError();
    try {
      await resetPassword(data.token, data.newPassword);
      setSuccess(true);
    } catch (e) {
      // error handled in store
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const labels = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];

    return {
      strength,
      label: labels[strength - 1] || "",
      color: colors[strength - 1] || "",
    };
  };

  const passwordStrength = getPasswordStrength(watchPassword || "");

  // Token invalide
  if (tokenValid === false) {
    return (
      <AuthLayout
        title="Lien invalide"
        subtitle="Le lien de réinitialisation est invalide ou a expiré"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Lien de réinitialisation invalide
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ce lien de réinitialisation n'est plus valide ou a expiré.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => (window.location.href = "/auth/forgot-password")}
              className="w-full"
            >
              Demander un nouveau lien
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/auth/login")}
              className="w-full"
            >
              Retour à la connexion
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Réinitialisation réussie
  if (success) {
    return (
      <AuthLayout
        title="Mot de passe modifié"
        subtitle="Votre mot de passe a été modifié avec succès"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Mot de passe modifié avec succès !
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vous pouvez maintenant vous connecter avec votre nouveau mot de
              passe.
            </p>
          </div>

          <Button
            onClick={() => (window.location.href = "/auth/login")}
            className="w-full"
          >
            Se connecter
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Chargement de la validation du token
  if (tokenValid === null) {
    return (
      <AuthLayout
        title="Vérification..."
        subtitle="Vérification du lien de réinitialisation"
      >
        <div className="text-center space-y-6">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400">
            Vérification du lien de réinitialisation...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t.auth?.reset_password_title || "Nouveau mot de passe"}
      subtitle="Choisissez un mot de passe fort et sécurisé"
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="destructive" onClose={clearError}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...register("token")} />

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Votre nouveau mot de passe"
                error={errors.newPassword?.message}
                className="pr-10"
                {...register("newPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Indicateur de force du mot de passe */}
            {watchPassword && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[60px]">
                    {passwordStrength.label}
                  </span>
                </div>

                {/* Critères de sécurité */}
                <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                  <div
                    className={`flex items-center ${
                      watchPassword.length >= 8
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="mr-1">
                      {watchPassword.length >= 8 ? "✓" : "○"}
                    </span>
                    8+ caractères
                  </div>
                  <div
                    className={`flex items-center ${
                      /[A-Z]/.test(watchPassword)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="mr-1">
                      {/[A-Z]/.test(watchPassword) ? "✓" : "○"}
                    </span>
                    Majuscule
                  </div>
                  <div
                    className={`flex items-center ${
                      /[a-z]/.test(watchPassword)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="mr-1">
                      {/[a-z]/.test(watchPassword) ? "✓" : "○"}
                    </span>
                    Minuscule
                  </div>
                  <div
                    className={`flex items-center ${
                      /\d/.test(watchPassword)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="mr-1">
                      {/\d/.test(watchPassword) ? "✓" : "○"}
                    </span>
                    Chiffre
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirmez votre nouveau mot de passe"
                error={errors.confirmPassword?.message}
                className="pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? t.hidePassword : t.showPassword
                }
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Modification en cours...</span>
              </div>
            ) : (
              "Modifier le mot de passe"
            )}
          </Button>
        </form>

        {/* Conseils de sécurité */}
        {/* <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            Conseils pour un mot de passe sécurisé :
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Utilisez au moins 8 caractères</li>
            <li>• Mélangez majuscules, minuscules, chiffres et symboles</li>
            <li>• Évitez les mots courants ou informations personnelles</li>
            <li>• N'utilisez pas ce mot de passe ailleurs</li>
          </ul>
        </div> */}
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
