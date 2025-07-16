import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import DashboardStats from "./DashboardStats";
import RecentActivity from "./RecentActivity";
import MapContainer from "../map/MapContainer";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";

export const DashboardPage: React.FC = () => {
  const { user, getCurrentUser, isLoading, error } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        if (!user) {
          await getCurrentUser();
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDashboard();
  }, [user, getCurrentUser]);

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400">
            {t.loading || "Chargement..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">{error}</Alert>
        </div>
      </div>
    );
  }

  return (
    <Base>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.dashboard || "Tableau de bord"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {user?.firstname && (
                <>
                  Bienvenue, {user.firstname} {user.lastname} !{" "}
                </>
              )}
              Vue d'ensemble de votre surveillance environnementale
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
              {t.export || "Exporter"}
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              Nouvelle analyse
            </button>
          </div>
        </div>

        {/* Stats */}
        <DashboardStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t.map || "Carte interactive"}
                </h3>
                <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                  Plein écran
                </button>
              </div>
              <div className="h-96">
                <MapContainer />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>

        {/* Additional Charts/Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tendances climatiques
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Graphique des tendances climatiques
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t.alerts || "Alertes"} récentes
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Liste des alertes récentes
            </div>
          </div>
        </div>
      </div>
    </Base>
  );
};
