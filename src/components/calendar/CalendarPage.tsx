import React from "react";
import { useTranslations } from "../../hooks/useTranslations";

const CalendarPage: React.FC = () => {
  const t = useTranslations();

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.calendar}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.calendar_description || "Event calendar and scheduling"}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t.calendar_events || "Calendar & Events"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t.calendar_events_description ||
              "Schedule and track environmental monitoring events and activities."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
