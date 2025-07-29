import React from "react";
import { useTranslations } from "../../hooks/useTranslations";

const AIAssistantPage: React.FC = () => {
  const t = useTranslations();

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.aiAssistant}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.ai_assistant_description ||
            "AI-powered environmental analysis assistant"}
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t.ai_assistant_coming_soon || "AI Assistant Coming Soon"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t.ai_assistant_development ||
              "We're working on bringing you an intelligent assistant for environmental data analysis."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
