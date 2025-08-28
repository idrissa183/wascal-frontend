import React, { useState } from "react";
import { Button } from "../ui/button";
import { useTranslations } from "../../hooks/useTranslations";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebook, FaLinkedin } from "react-icons/fa";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { getApiBaseUrl } from "../../constants";
import { useAuthStore } from "../../stores/useAuthStore";

interface SocialAuthProps {
  mode?: "login" | "register";
  onError?: (error: string) => void;
  onSuccess?: () => void; 
}

export const SocialAuth: React.FC<SocialAuthProps> = ({
  mode = "login",
  onError,
  onSuccess,
}) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const t = useTranslations();
  const { setUser, setAuthenticated } = useAuthStore();

  const handleOAuthLogin = async (
    provider: "google" | "github" | "facebook" | "linkedin"
  ) => {
    try {
      setLoadingProvider(provider);

      const apiBaseUrl = getApiBaseUrl();

      console.log(`Initiating ${provider} OAuth...`);

      // 1. Obtenir l'URL d'autorisation
      const response = await fetch(
        `${apiBaseUrl}/api/v1/auth/oauth/${provider}/login`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            t.errors?.server_error ||
            `Erreur lors de l'initiation de l'authentification ${provider}`
        );
      }

      const data = await response.json();

      if (!data.auth_url) {
        throw new Error(`URL d'authentification ${provider} non disponible`);
      }

      console.log(`Opening ${provider} OAuth popup...`);

      // 2. Essayer d'ouvrir une popup avec différentes stratégies
      let popup: Window | null = null;
      
      try {
        // First attempt: Try with minimal features for better compatibility
        popup = window.open(
          data.auth_url,
          `${provider}_oauth_${Date.now()}`,
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        
        // Check if popup was successfully opened
        if (!popup) {
          throw new Error('Popup blocked');
        }
        
        // Additional check for immediate closure (some popup blockers do this)
        const checkPopupClosure = () => {
          if (popup?.closed) {
            console.warn('Popup was immediately closed by popup blocker');
            // Don't throw here, just use fallback
            const userConfirmed = window.confirm(
              "Les popups semblent être bloquées par votre navigateur. " +
              "Cliquez OK pour continuer l'authentification dans cet onglet."
            );
            
            if (userConfirmed) {
              window.location.href = data.auth_url;
            }
            return;
          }
        };
        
        setTimeout(checkPopupClosure, 100);
        
      } catch (error) {
        console.warn('Popup failed, using fallback:', error);
        
        // Show user a message about popup blocker if needed
        const userConfirmed = window.confirm(
          "Les popups semblent être bloquées par votre navigateur. " +
          "Cliquez OK pour continuer l'authentification dans cet onglet."
        );
        
        if (userConfirmed) {
          // Fallback: Use same-tab redirect if popup fails
          window.location.href = data.auth_url;
        }
        return;
      }

      // Focus on the popup
      popup.focus();

      // 3. Variables pour le nettoyage
      let checkClosed: NodeJS.Timeout;
      let timeoutId: NodeJS.Timeout;

      // 4. Écouter les messages de la popup
      const handleMessage = async (event: MessageEvent) => {
        // Vérifier l'origine pour la sécurité
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === "OAUTH_SUCCESS") {
          // Clean up all timers and listeners immediately
          clearInterval(checkClosed);
          clearTimeout(timeoutId);
          window.removeEventListener("message", handleMessage);
          
          // Ensure popup is closed and focus returns to parent
          if (!popup.closed) {
            popup.close();
          }
          window.focus();

          const { access_token, refresh_token, user } = event.data;

          if (access_token && refresh_token && user) {
            // Stocker les tokens
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);

            // Mettre à jour le store complètement
            setUser(user);
            setAuthenticated(true);
            
            // Also update the auth store state to ensure everything is synchronized
            const authStore = useAuthStore.getState();
            authStore.setUser(user);
            useAuthStore.setState({ isAuthenticated: true });

            console.log(
              `${provider} OAuth successful, redirecting to dashboard...`
            );

            // ✅ Execute callback first
            onSuccess?.();
            
            // Navigate in the same tab immediately
            console.log('Current pathname:', window.location.pathname);
            console.log('Redirecting to dashboard in same tab...');
            
            // Use a very short timeout to ensure state updates are complete
            setTimeout(() => {
              window.location.replace('/dashboard');
            }, 200); // Slightly longer to ensure store updates
          } else {
            throw new Error("Données OAuth incomplètes");
          }
        } else if (event.data.type === "OAUTH_ERROR") {
          // Clean up all timers and listeners
          clearInterval(checkClosed);
          clearTimeout(timeoutId);
          window.removeEventListener("message", handleMessage);
          popup.close();
          window.focus();
          throw new Error(
            event.data.error || `Erreur d'authentification ${provider}`
          );
        }
      };

      window.addEventListener("message", handleMessage);

      // 5. Surveiller la fermeture de la popup avec nettoyage amélioré
      checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          clearTimeout(timeoutId);
          window.removeEventListener("message", handleMessage);
          setLoadingProvider(null);
          window.focus(); // Return focus to parent window
          console.log("OAuth popup was closed by user");
        }
      }, 500); // Check more frequently for better UX
      
      // 6. Timeout de sécurité pour éviter les popups bloquées
      timeoutId = setTimeout(() => {
        if (!popup.closed) {
          clearInterval(checkClosed);
          clearTimeout(timeoutId);
          window.removeEventListener("message", handleMessage);
          popup.close();
          setLoadingProvider(null);
          onError?.("Timeout d'authentification. Veuillez réessayer.");
        }
      }, 300000); // 5 minutes timeout
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t.errors?.unknown_error || `Erreur d'authentification ${provider}`;

      console.error(`${provider} OAuth error:`, error);
      onError?.(errorMessage);
    } finally {
      setLoadingProvider(null);
    }
  };

  const isRegisterMode = mode === "register";

  const getButtonText = (
    provider: "google" | "github" | "facebook" | "linkedin"
  ) => {
    if (isRegisterMode) {
      switch (provider) {
        case "google":
          return t.auth?.oauth?.signup_with_google || "S'inscrire avec Google";
        case "github":
          return t.auth?.oauth?.signup_with_github || "S'inscrire avec GitHub";
        case "facebook":
          return (
            t.auth?.oauth?.signup_with_facebook || "S'inscrire avec Facebook"
          );
        case "linkedin":
          return (
            t.auth?.oauth?.signup_with_linkedin || "S'inscrire avec LinkedIn"
          );
        default:
          return `S'inscrire avec ${provider}`;
      }
    } else {
      switch (provider) {
        case "google":
          return t.auth?.oauth?.login_with_google || "Se connecter avec Google";
        case "github":
          return t.auth?.oauth?.login_with_github || "Se connecter avec GitHub";
        case "facebook":
          return (
            t.auth?.oauth?.login_with_facebook || "Se connecter avec Facebook"
          );
        case "linkedin":
          return (
            t.auth?.oauth?.login_with_linkedin || "Se connecter avec LinkedIn"
          );
        default:
          return `Se connecter avec ${provider}`;
      }
    }
  };

  const getProviderIcon = (
    provider: "google" | "github" | "facebook" | "linkedin"
  ) => {
    switch (provider) {
      case "google":
        return <FcGoogle className="h-5 w-5 mr-2" />;
      case "github":
        return <FaGithub className="h-5 w-5 mr-2" />;
      case "facebook":
        return <FaFacebook className="h-5 w-5 mr-2 text-blue-600" />;
      case "linkedin":
        return <FaLinkedin className="h-5 w-5 mr-2 text-blue-700" />;
      default:
        return null;
    }
  };

  const providers = [
    { name: "google", color: "border-gray-300 hover:border-blue-400" },
    { name: "github", color: "border-gray-300 hover:border-gray-600" },
    { name: "facebook", color: "border-gray-300 hover:border-blue-600" },
    { name: "linkedin", color: "border-gray-300 hover:border-blue-800" },
  ] as const;

  return (
    <div className="space-y-3">
      {providers.map(({ name, color }) => (
        <Button
          key={name}
          type="button"
          variant="outline"
          onClick={() => handleOAuthLogin(name)}
          disabled={loadingProvider !== null}
          className={`w-full transition-all duration-200 ${color}`}
        >
          {loadingProvider === name ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            getProviderIcon(name)
          )}
          {getButtonText(name)}
        </Button>
      ))}

      {/* Instructions pour l'utilisateur */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          {t.connectingAgree || "En vous connectant, vous acceptez nos"}{" "}
          <a
            href="https://doc-hosting.flycricket.io/la-cause-rurale-terms-of-use/78422ce1-34a2-4405-80b7-512c558512f7/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-500 underline"
          >
            {t.termsLink || "conditions d'utilisation"}
          </a>{" "}
          {t.andOur || "et notre"}{" "}
          <a
            href="https://doc-hosting.flycricket.io/la-cause-rurale-privacy-policy/d328883c-83a8-477a-a5fc-1a27aec79002/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-500 underline"
          >
            {t.privacyLink || "politique de confidentialité"}
          </a>
        </p>
      </div>
    </div>
  );
};
