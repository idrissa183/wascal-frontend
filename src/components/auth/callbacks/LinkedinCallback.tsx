import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../stores/useAuthStore';
import { authService } from '../../../services/auth.service';
import { useTranslations } from '../../../hooks/useTranslations';

const LinkedinCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setIsAuthenticated } = useAuthStore();
  const t = useTranslations();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        
        if (error) {
          console.error('OAuth error:', error);
          navigate('/auth/login?error=oauth_error');
          return;
        }

        if (!code) {
          navigate('/auth/login?error=missing_code');
          return;
        }

        const response = await authService.handleOAuthCallback('linkedin', code);
        
        if (response.success && response.data.user && response.data.token) {
          localStorage.setItem('token', response.data.token);
          setUser(response.data.user);
          setIsAuthenticated(true);
          navigate('/dashboard');
        } else {
          navigate('/auth/login?error=callback_failed');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/auth/login?error=oauth_error');
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser, setIsAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t.processing_login || "Processing login..."}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t.please_wait || "Please wait while we sign you in."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LinkedinCallback;