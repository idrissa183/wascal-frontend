import React, { useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { LoginForm } from "./LoginForm";
import { useTranslations } from "../../hooks/useTranslations";
import { SocialAuth } from "./SocialAuth";

export const LoginPage: React.FC = () => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const t = useTranslations();

  const handleLoginSuccess = () => {
    // Rediriger vers le dashboard
    window.location.href = "/dashboard";
  };

  const handleSwitchToRegister = () => {
    window.location.href = "/auth/register";
  };

  const handleSetError = (error: string) => {
    setGlobalError(error);
  };

  const clearGlobalError = () => {
    setGlobalError(null);
  };

  // Gestionnaire pour le succès OAuth
  const handleOAuthSuccess = () => {
    console.log("OAuth login successful, redirecting to dashboard...");
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
          globalError={globalError}
          onClearGlobalError={clearGlobalError}
          onSetGlobalError={handleSetError}
        />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {t.orContinueWith || "Ou continuer avec"}
            </span>
          </div>
        </div>

        <SocialAuth
          mode="login"
          onError={handleSetError}
          onSuccess={handleOAuthSuccess}
        />
      </div>
    </AuthLayout>
  );
};
