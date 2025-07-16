import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTranslations } from "../../hooks/useTranslations";
import { loginSchema, type LoginFormData } from "../../lib/validation";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Alert } from "../ui/Alert";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      await login(data);
      onSuccess?.();
    } catch (error) {
      // L'erreur est déjà gérée dans le store
      if (error instanceof Error) {
        if (error.message.includes("invalid_credentials")) {
          setError("email", {
            message: t.auth?.invalid_credentials || "Invalid credentials",
          });
          setError("password", {
            message: t.auth?.invalid_credentials || "Invalid credentials",
          });
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.auth?.login || "Sign in"}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t.auth?.login_subtitle || "Sign in to your account"}
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
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
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
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t.password || "Password"}
          </label>
          <div className="mt-1">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t.passwordPlaceholder || "Your password"}
                error={errors.password?.message}
                className="pr-10"
                {...register("password")}
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
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
              {...register("rememberMe")}
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              {t.rememberMe || "Remember me"}
            </label>
          </div>

          <div className="text-sm">
            <a
              href="/auth/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {t.forgotPassword || "Forgot password?"}
            </a>
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
              <span className="ml-2">{t.loggingIn || "Signing in..."}</span>
            </div>
          ) : (
            t.login || "Sign in"
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t.noAccount || "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="cursor-pointer font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {t.registerHere || "Sign up here"}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
