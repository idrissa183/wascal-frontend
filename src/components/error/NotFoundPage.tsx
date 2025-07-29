import React from "react";
import { Link } from "react-router-dom";
import { useTranslations } from "../../hooks/useTranslations";

const NotFoundPage: React.FC = () => {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">
            404
          </h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {t.page_not_found || "Page not found"}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t.page_not_found_description ||
              "Sorry, we couldn't find the page you're looking for."}
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600"
          >
            <svg
              className="mr-2 -ml-1 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {t.back_to_dashboard || "Back to Dashboard"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
