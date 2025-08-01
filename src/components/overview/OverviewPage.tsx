import React, { useState, useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import {
  EyeIcon,
  ChartBarIcon,
  MapIcon,
  ClockIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  GlobeAltIcon,
  CloudIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";

interface OverviewMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

interface RegionSummary {
  id: string;
  name: string;
  activeStations: number;
  totalStations: number;
  alerts: number;
  lastUpdate: string;
  keyMetrics: {
    temperature: number;
    humidity: number;
    precipitation: number;
  };
}

export const OverviewPage: React.FC = () => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("24h");

  // Métriques générales
  const [metrics] = useState<OverviewMetric[]>([
    {
      id: "stations",
      name: "Stations Actives",
      value: "24",
      unit: "stations",
      change: 8.3,
      trend: "up",
      icon: MapIcon,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "data-points",
      name: "Points de Données",
      value: "2.4M",
      unit: "collectés",
      change: 12.5,
      trend: "up",
      icon: ChartBarIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "alerts",
      name: "Alertes Actives",
      value: "8",
      unit: "alertes",
      change: -15.2,
      trend: "down",
      icon: ExclamationTriangleIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      id: "coverage",
      name: "Couverture",
      value: "85",
      unit: "% du territoire",
      change: 5.7,
      trend: "up",
      icon: GlobeAltIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ]);

  // Résumé par région
  const [regionSummaries] = useState<RegionSummary[]>([
    {
      id: "centre",
      name: "Centre",
      activeStations: 6,
      totalStations: 8,
      alerts: 2,
      lastUpdate: "2024-01-15T10:30:00Z",
      keyMetrics: {
        temperature: 32.5,
        humidity: 65,
        precipitation: 0,
      },
    },
    {
      id: "sahel",
      name: "Sahel",
      activeStations: 4,
      totalStations: 6,
      alerts: 3,
      lastUpdate: "2024-01-15T10:25:00Z",
      keyMetrics: {
        temperature: 38.2,
        humidity: 25,
        precipitation: 0,
      },
    },
    {
      id: "sud-ouest",
      name: "Sud-Ouest",
      activeStations: 5,
      totalStations: 5,
      alerts: 0,
      lastUpdate: "2024-01-15T10:28:00Z",
      keyMetrics: {
        temperature: 29.8,
        humidity: 72,
        precipitation: 2.5,
      },
    },
    {
      id: "est",
      name: "Est",
      activeStations: 3,
      totalStations: 4,
      alerts: 1,
      lastUpdate: "2024-01-15T10:20:00Z",
      keyMetrics: {
        temperature: 31.2,
        humidity: 58,
        precipitation: 0,
      },
    },
    {
      id: "nord",
      name: "Nord",
      activeStations: 4,
      totalStations: 5,
      alerts: 2,
      lastUpdate: "2024-01-15T10:15:00Z",
      keyMetrics: {
        temperature: 35.8,
        humidity: 42,
        precipitation: 0,
      },
    },
    {
      id: "hauts-bassins",
      name: "Hauts-Bassins",
      activeStations: 2,
      totalStations: 3,
      alerts: 0,
      lastUpdate: "2024-01-15T10:32:00Z",
      keyMetrics: {
        temperature: 28.5,
        humidity: 78,
        precipitation: 1.2,
      },
    },
  ]);

  const periods = [
    { id: "1h", name: "Dernière heure" },
    { id: "24h", name: "24 dernières heures" },
    { id: "7d", name: "7 derniers jours" },
    { id: "30d", name: "30 derniers jours" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up") {
      return <TrendingUpIcon className="w-4 h-4 text-green-500" />;
    } else if (trend === "down") {
      return <TrendingDownIcon className="w-4 h-4 text-red-500" />;
    }
    return <span className="text-gray-500">→</span>;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getConnectivityPercentage = (active: number, total: number) => {
    return Math.round((active / total) * 100);
  };

  const getConnectivityColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <Base>
        <div className="responsive-loading">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Chargement de l'aperçu...
          </p>
        </div>
      </Base>
    );
  }

  return (
    <Base>
      <div className="space-y-4 sm:space-y-6">
        {/* En-tête */}
        <div className="responsive-flex items-start sm:items-center justify-between">
          <div>
            <h1 className="responsive-heading-lg font-bold text-gray-900 dark:text-white flex items-center">
              <EyeIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-green-600" />
              Aperçu Général
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Vue d'ensemble du système de surveillance environnementale
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Période:
            </span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="responsive-stats-grid">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.name}
                  </p>
                  <div className="flex items-baseline mt-2">
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </p>
                    <p className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {metric.unit}
                    </p>
                  </div>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(metric.trend)}
                    <span
                      className={`text-xs sm:text-sm font-medium ml-1 ${
                        metric.trend === "up"
                          ? "text-green-600 dark:text-green-400"
                          : metric.trend === "down"
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {metric.change > 0 ? "+" : ""}
                      {metric.change}%
                    </span>
                  </div>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Résumé par région */}
        <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="responsive-padding border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <MapIcon className="w-5 h-5 mr-2" />
              État par Région
            </h3>
          </div>
          <div className="responsive-padding">
            <div className="responsive-grid">
              {regionSummaries.map((region) => {
                const connectivity = getConnectivityPercentage(
                  region.activeStations,
                  region.totalStations
                );
                return (
                  <div
                    key={region.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {region.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {region.alerts > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            {region.alerts} alerte{region.alerts > 1 ? "s" : ""}
                          </span>
                        )}
                        <span
                          className={`text-sm font-medium ${getConnectivityColor(
                            connectivity
                          )}`}
                        >
                          {connectivity}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Stations:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {region.activeStations}/{region.totalStations}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Température:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {region.keyMetrics.temperature}°C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Humidité:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {region.keyMetrics.humidity}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Précipitations:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {region.keyMetrics.precipitation} mm
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <ClockIcon className="w-3 h-3" />
                        <span>Mis à jour: {formatTime(region.lastUpdate)}</span>
                      </div>
                    </div>

                    {/* Barre de connectivité */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Connectivité</span>
                        <span>{connectivity}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            connectivity >= 90
                              ? "bg-green-500"
                              : connectivity >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${connectivity}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Graphiques de tendances */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="responsive-padding border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Tendances Climatiques
              </h3>
            </div>
            <div className="responsive-padding">
              <div className="responsive-chart flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="text-center">
                  <CloudIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Graphique des tendances climatiques</p>
                  <p className="text-sm mt-1">Période: {selectedPeriod}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="responsive-padding border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <GlobeAltIcon className="w-5 h-5 mr-2" />
                Couverture Géographique
              </h3>
            </div>
            <div className="responsive-padding">
              <div className="responsive-chart flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="text-center">
                  <MapIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Carte de couverture des stations</p>
                  <p className="text-sm mt-1">
                    {regionSummaries.reduce((sum, r) => sum + r.activeStations, 0)} stations actives
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes système */}
        <div className="space-y-4">
          <Alert variant="warning">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-200">
                  Conditions Météorologiques Extrêmes
                </h4>
                <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
                  Températures élevées détectées dans les régions du Sahel et du Nord.
                  3 stations signalent des conditions critiques.
                </p>
              </div>
            </div>
          </Alert>

          <Alert>
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-200">
                  Système de Surveillance Opérationnel
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                  {regionSummaries.reduce((sum, r) => sum + r.activeStations, 0)} stations
                  sur {regionSummaries.reduce((sum, r) => sum + r.totalStations, 0)} sont
                  opérationnelles. Couverture globale: 85% du territoire WASCAL.
                </p>
              </div>
            </div>
          </Alert>
        </div>

        {/* Résumé des données récentes */}
        <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="responsive-padding border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Activité Récente
            </h3>
          </div>
          <div className="responsive-padding">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <CloudIcon className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Nouvelle analyse climatique générée
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Région Centre - il y a 15 minutes
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Alerte température élevée
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Station Dori - il y a 25 minutes
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <BeakerIcon className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Données de sol mises à jour
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Région Sud-Ouest - il y a 1 heure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  );
};