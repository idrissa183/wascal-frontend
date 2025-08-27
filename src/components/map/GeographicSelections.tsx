import React from "react";
import { useGeographicStore } from "../../stores/useGeographicStore";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useTranslations } from "../../hooks/useTranslations";

export const GeographicSelections: React.FC = () => {
  const { selectedEntities, removeSelection, clearSelections } =
    useGeographicStore();
  const t = useTranslations();

  if (selectedEntities.length === 0) {
    return null;
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "country":
        return "🌍";
      case "region":
        return "📍";
      case "province":
        return "🏛️";
      default:
        return "📌";
    }
  };

  const getStatusIndicator = (entity: any) => {
    if (entity.isLoading) {
      return (
        <div className="w-4 h-4 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      );
    }

    if (entity.error) {
      return (
        <ExclamationTriangleIcon
          className="w-4 h-4 text-red-500"
          title={entity.error}
        />
      );
    }

    if (entity.geometry) {
      return (
        <CheckCircleIcon
          className="w-4 h-4 text-green-500"
          title="Loaded successfully"
        />
      );
    }

    return null;
  };

  return (
    <div className="absolute top-4 right-4 z-40 max-w-xs">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {t.geographicSelections?.title}
          </h3>
          <button
            onClick={clearSelections}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {t.geographicSelections?.clearAll}
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {selectedEntities.map((entity) => (
            <div
              key={`${entity.type}-${entity.id}`}
              className={`flex items-center justify-between p-2 rounded-md transition-colors ${
                entity.geometry
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  : entity.error
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  : "bg-gray-50 dark:bg-gray-700"
              }`}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <span className="text-sm">{getEntityIcon(entity.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                    {entity.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {entity.type}
                    {entity.geometry &&
                      ` • ${t.geographicSelections?.visibleOnMap}`}
                  </div>
                  {entity.error && (
                    <div className="text-xs text-red-600 dark:text-red-400 truncate">
                      {entity.error}
                    </div>
                  )}
                </div>
                {getStatusIndicator(entity)}
              </div>

              <button
                onClick={() => removeSelection(entity.id, entity.type)}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title={t.geographicSelections?.removeFromMap}
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
