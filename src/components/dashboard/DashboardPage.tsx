import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import RecentActivity from "./RecentActivity";
import MapContainer from "../map/MapContainer";
import NavigationTest from "../debug/NavigationTest";
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
      <div className="space-y-4 sm:space-y-6">
        {/* Navigation Test Component */}
        {/* <NavigationTest /> */}
        {/* Main Content Grid */}
        <div className="responsive-dashboard gap-4 sm:gap-6">
          {/* Map */}
          <div className="lg:col-span-2 min-w-0">
            <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {t.map || "Carte interactive"}
                </h3>
                <a
                  href="/map"
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center space-x-1 transition-colors"
                >
                  <span>Plein écran</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
              {/* <div className="responsive-map">
                <MapContainer />
              </div> */}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1 min-w-0">
            <RecentActivity />
          </div>
        </div>
      </div>
    </Base>
  );
};
