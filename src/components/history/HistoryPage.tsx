import React from "react";
import { useTranslations } from "../../hooks/useTranslations";

const HistoryPage: React.FC = () => {
  const t = useTranslations();

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.history}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.history_description || "Historical data and activity logs"}
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t.activity_history || "Activity History"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t.history_logs_description ||
              "View historical environmental data and system activity logs."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
