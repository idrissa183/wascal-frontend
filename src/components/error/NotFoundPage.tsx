import React from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import { HomeIcon, MapIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export const NotFoundPage: React.FC = () => {
  const t = useTranslations();

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleGoToMap = () => {
    window.location.href = '/map';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Number */}
          <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">
            404
          </h1>
          
          {/* Error Message */}
          <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
            {t.notFound?.title || 'Page Not Found'}
          </h2>
          
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {t.notFound?.message || 
             'Sorry, we couldn\'t find the page you\'re looking for. The page may have been moved, deleted, or the URL might be incorrect.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            {t.notFound?.goHome || 'Go to Homepage'}
          </button>

          <div className="flex space-x-4">
            <button
              onClick={handleGoToDashboard}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              {t.notFound?.dashboard || 'Dashboard'}
            </button>

            <button
              onClick={handleGoToMap}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <MapIcon className="w-4 h-4 mr-2" />
              {t.notFound?.map || 'Map'}
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.notFound?.helpText || 
             'If you think this is a mistake, please contact our support team.'}
          </p>
          
          <div className="mt-4">
            <button
              onClick={() => window.history.back()}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              ← {t.notFound?.goBack || 'Go back to previous page'}
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full opacity-20"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-green-100 dark:bg-green-900 rounded-full opacity-10"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full opacity-15"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full opacity-20"></div>
      </div>
    </div>
  );
};