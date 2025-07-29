import React from "react";
import { useTranslations } from "../../hooks/useTranslations";

const HelpPage: React.FC = () => {
  const t = useTranslations();

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.help}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.help_description || "Help and documentation"}
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t.help_support || "Help & Support"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t.help_documentation_description ||
              "Find help, documentation, and support resources for the platform."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
