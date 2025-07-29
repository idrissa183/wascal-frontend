import React from 'react';
import { useTranslations } from '../../hooks/useTranslations';

const PrecipitationPage: React.FC = () => {
  const t = useTranslations();

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.precipitation}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.precipitation_description || "Precipitation monitoring and analysis"}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t.precipitation_data || "Precipitation Data"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t.precipitation_monitoring_description || "Track rainfall and precipitation patterns across monitored regions."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrecipitationPage;