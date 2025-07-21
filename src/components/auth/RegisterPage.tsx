import React, { useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { RegisterForm } from "./RegisterForm";
import { useTranslations } from "../../hooks/useTranslations";
import { SocialAuth } from "./SocialAuth";

export const RegisterPage: React.FC = () => {
  const [globalError, setGlobalError] = useState<string | null>(null);
  const t = useTranslations();

  const handleRegisterSuccess = () => {
    // Rediriger vers une page de confirmation ou le dashboard
    window.location.href = "/auth/verify-email";
  };

  const handleSwitchToLogin = () => {
    window.location.href = "/auth/login";
  };

  const handleSetError = (error: string) => {
    setGlobalError(error);
  };

  const clearGlobalError = () => {
    setGlobalError(null);
  };

  // ✅ Gestionnaire pour le succès OAuth
  const handleOAuthSuccess = () => {
    console.log("OAuth registration successful, redirecting to dashboard...");
    // Pour OAuth, redirection directe vers le dashboard (pas de vérification email)
    // La redirection est déjà gérée dans SocialAuth
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={handleSwitchToLogin}
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
          mode="register"
          onError={handleSetError}
          onSuccess={handleOAuthSuccess}
        />
      </div>
    </AuthLayout>
  );
};
