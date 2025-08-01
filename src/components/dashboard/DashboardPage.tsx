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
        <div className="responsive-dashboard gap-4 sm:gap-6"></div>
      </div>
    </Base>
  );
};
