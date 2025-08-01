import React, { useState, useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import {
  GlobeAltIcon,
  ChartBarIcon,
  MapIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export const VegetationPage: React.FC = () => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Base>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 dark:text-gray-400">
              Chargement des données de végétation...
            </p>
          </div>
        </div>
      </Base>
    );
  }

  return (
    <Base>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <GlobeAltIcon className="w-8 h-8 mr-3 text-green-600" />
              Données de Végétation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Surveillance de la végétation et indices de santé des écosystèmes
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <GlobeAltIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Module en développement
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Le module de données de végétation sera bientôt disponible avec
              les indices NDVI, NDWI et plus encore.
            </p>
          </div>
        </div>

        <Alert>
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200">
                Fonctionnalités prévues
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                NDVI, NDWI, EVI, biomasse, couverture forestière, détection de
                changements, et analyses temporelles.
              </p>
            </div>
          </div>
        </Alert>
      </div>
    </Base>
  );
};
