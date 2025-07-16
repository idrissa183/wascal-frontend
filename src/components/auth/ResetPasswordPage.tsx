import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
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
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    clearError();
    try {
      await resetPassword(data.token, data.newPassword);
      setSuccess(true);
    } catch (e) {
      // error handled in store
    }
  };

  if (success) {
    return (
      <AuthLayout
        title={t.auth?.reset_password_title || "Reset password"}
        subtitle={
          t.auth?.reset_password_success || "Your password has been reset."
        }
      >
        <div className="text-center space-y-6">
          <Button onClick={() => (window.location.href = "/auth/login")}>
            {t.auth?.go_to_login || "Go to login"}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t.auth?.reset_password_title || "Reset password"}
      subtitle={t.auth?.reset_password_subtitle || "Enter your new password"}
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
              {t.password || "Password"}
            </label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t.passwordPlaceholder || "Your password"}
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
            disabled={!isValid}
            loading={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">{t.auth?.sending || "Sending..."}</span>
              </div>
            ) : (
              t.auth?.reset_password_title || "Reset password"
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
