import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTranslations } from "../../hooks/useTranslations";
import { AuthLayout } from "./AuthLayout";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { authService } from "../../services/auth.service";

export const AuthCallbackClient: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const { setUser, setLoading } = useAuthStore();
  const t = useTranslations();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const provider = window.location.pathname.split('/').pop(); // google ou github

        if (!code) {
          throw new Error('Authorization code not found');
        }

        if (!provider || !['google', 'github'].includes(provider)) {
          throw new Error('Invalid OAuth provider');
        }

        setLoading(true);

        // Gérer le callback OAuth
        const authResponse = await authService.handleOAuthCallback(
          provider,
          code,
          state || undefined
        );

        // Mettre à jour le store
        setUser(authResponse.user);
        setStatus('success');

        // Rediriger vers le dashboard après un court délai
        setTimeout(() => {
          const returnUrl = urlParams.get('returnUrl') || '/dashboard';
          window.location.href = returnUrl;
        }, 2000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error instanceof Error ? error.message : 'OAuth authentication failed');
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [setUser, setLoading]);

  const handleRetryLogin = () => {
    window.location.href = '/auth/login';
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-6">
            <LoadingSpinner size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t.auth?.processing_login || "Traitement de la connexion..."}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.auth?.please_wait || "Veuillez patienter pendant que nous vous connectons."}
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
          </div>
        );

      case 'error':
        return (
          <div className="space-y-6">
            <Alert variant="destructive">
              {error || t.auth?.oauth_error || "Erreur lors de l'authentification OAuth"}
            </Alert>
            <div className="text-center">
              <Button onClick={handleRetryLogin} className="w-full">
                {t.auth?.back_to_login || "Retour à la connexion"}
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
        status === 'success' 
          ? t.auth?.login_success || "Connexion réussie"
          : status === 'error'
          ? t.auth?.login_failed || "Échec de la connexion"
          : t.auth?.login_title || "Connexion en cours"
      }
    >
      {renderContent()}
    </AuthLayout>
  );
};