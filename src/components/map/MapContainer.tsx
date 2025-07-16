import React, { useEffect, useRef } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { useTranslations } from "../../hooks/useTranslations";

export default function MapContainer() {
  const mapRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const t = useTranslations();

  useEffect(() => {
    // Initialize OpenLayers map here
    // This is a placeholder for the actual map implementation
    if (mapRef.current) {
      // Map initialization code will go here
      console.log("Map container ready for OpenLayers initialization");
    }
  }, []);

  return (
    <div className="relative h-full w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* Map Search */}
      <div className="absolute top-4 left-4 z-10">
        <div className="relative">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-64 px-4 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <button className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
          <span className="sr-only">btn</span>
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
        <button className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
          <span className="sr-only">btn</span>
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full min-h-[500px]"
      >
        {/* Placeholder content */}
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">{t.loading}</p>
          </div>
        </div>
      </div>

      {/* Layer Control Panel */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {language === "fr" ? "Couches de données" : "Data Layers"}
          </h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                NDVI
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {language === "fr" ? "Température" : "Temperature"}
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {language === "fr" ? "Précipitations" : "Precipitation"}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
