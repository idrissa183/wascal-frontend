import React from "react";
import { useTranslations } from "../../hooks/useTranslations";

const ReportsPage: React.FC = () => {
  const t = useTranslations();

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.reports}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.reports_description ||
            "Environmental monitoring reports and analysis"}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary-600 dark:text-primary-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a4 4 0 01-4-4V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t.environmental_reports || "Environmental Reports"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t.reports_coming_soon ||
              "Detailed environmental monitoring reports will be available here."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
