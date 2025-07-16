import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTranslations } from "../../hooks/useTranslations";
import { registerSchema, type RegisterFormData } from "../../lib/validation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Alert } from "../ui/Alert";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
  } = useAuthStore();
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const watchPassword = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      await registerUser(data);
      onSuccess?.();
    } catch (error) {
      // L'erreur est déjà gérée dans le store
      if (error instanceof Error) {
        if (error.message.includes("email_already_exists")) {
          setError("email", {
            message: t.user?.email_already_exists || "Email already exists",
          });
        }
      }
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

    const labels = ["Très faible", "Faible", "Moyenne", "Forte", "Très forte"];
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.register || "Create account"}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t.register_subtitle || "Create your account to get started"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" onClose={clearError}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstname"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t.firstName || "First name"}
            </label>
            <Input
              id="firstname"
              type="text"
              autoComplete="given-name"
              placeholder={t.firstNamePlaceholder || "John"}
              error={errors.firstname?.message}
              {...register("firstname")}
            />
          </div>

          <div>
            <label
              htmlFor="lastname"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t.lastName || "Last name"}
            </label>
            <Input
              id="lastname"
              type="text"
              autoComplete="family-name"
              placeholder={t.lastNamePlaceholder || "Doe"}
              error={errors.lastname?.message}
              {...register("lastname")}
            />
          </div>
        </div>

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
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t.phone || "Phone"}{" "}
            <span className="text-gray-400">({t.optional || "optional"})</span>
          </label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder={t.phonePlaceholder || "+226 XX XX XX XX"}
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t.password || "Password"}
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={t.passwordPlaceholder || "Your password"}
              error={errors.password?.message}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {passwordStrength.label}
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t.confirmPassword || "Confirm password"}
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={
                t.confirmPasswordPlaceholder || "Confirm your password"
              }
              error={errors.confirmPassword?.message}
              className="pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? t.hidePassword : t.showPassword}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-start">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              {...register("terms")}
            />
            <label
              htmlFor="terms"
              className="ml-3 block text-sm text-gray-900 dark:text-gray-300"
            >
              {t.terms || "I accept the"}{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {t.termsLink || "terms of service"}
              </a>{" "}
              {t.and || "and"}{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {t.privacyLink || "privacy policy"}
              </a>
            </label>
          </div>
          {errors.terms && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.terms.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={!isValid}
          loading={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2">
                {t.registering || "Creating account..."}
              </span>
            </div>
          ) : (
            t.register || "Create account"
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t.noRegister || "Already have an account?"}{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="cursor-pointer font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {t.loginHere || "Sign in here"}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
