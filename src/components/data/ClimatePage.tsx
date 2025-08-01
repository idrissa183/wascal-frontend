import React, { useState, useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import {
  CloudIcon,
  BeakerIcon,
  EyeDropperIcon,
  WindowIcon,
  SunIcon,
  CalendarIcon,
  MapIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface ClimateData {
  parameter: string;
  currentValue: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
  lastUpdate: string;
  min24h: number;
  max24h: number;
  icon: React.ComponentType<{ className?: string }>;
}

export const ClimatePage: React.FC = () => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("24h");
  const [viewMode, setViewMode] = useState<"grid" | "chart">("grid");

  // Données climatiques d'exemple
  const [climateData] = useState<ClimateData[]>([
    {
      parameter: "Température",
      currentValue: 32.5,
      unit: "°C",
      trend: "up",
      change: 2.3,
      lastUpdate: "2024-01-15T10:30:00Z",
      min24h: 24.2,
      max24h: 35.1,
      icon: SunIcon,
    },
    {
      parameter: "Humidité",
      currentValue: 65,
      unit: "%",
      trend: "down",
      change: -5.2,
      lastUpdate: "2024-01-15T10:30:00Z",
      min24h: 58,
      max24h: 78,
      icon: EyeDropperIcon,
    },
    {
      parameter: "Pression",
      currentValue: 1013.2,
      unit: "hPa",
      trend: "stable",
      change: 0.1,
      lastUpdate: "2024-01-15T10:30:00Z",
      min24h: 1011.8,
      max24h: 1015.4,
      icon: BeakerIcon,
    },
    {
      parameter: "Précipitations",
      currentValue: 0,
      unit: "mm",
      trend: "stable",
      change: 0,
      lastUpdate: "2024-01-15T10:30:00Z",
      min24h: 0,
      max24h: 2.5,
      icon: CloudIcon,
    },
    {
      parameter: "Vitesse du vent",
      currentValue: 15.2,
      unit: "km/h",
      trend: "up",
      change: 3.8,
      lastUpdate: "2024-01-15T10:30:00Z",
      min24h: 8.5,
      max24h: 22.1,
      icon: WindowIcon,
    },
    {
      parameter: "Index UV",
      currentValue: 8.5,
      unit: "",
      trend: "up",
      change: 1.2,
      lastUpdate: "2024-01-15T10:30:00Z",
      min24h: 0,
      max24h: 11.2,
      icon: SunIcon,
    },
  ]);

  const regions = [
    { id: "all", name: "Toutes les régions" },
    { id: "centre", name: "Centre" },
    { id: "nord", name: "Nord" },
    { id: "sud-ouest", name: "Sud-Ouest" },
    { id: "est", name: "Est" },
    { id: "sahel", name: "Sahel" },
  ];

  const periods = [
    { id: "1h", name: "Dernière heure" },
    { id: "24h", name: "24 dernières heures" },
    { id: "7d", name: "7 derniers jours" },
    { id: "30d", name: "30 derniers jours" },
  ];

  useEffect(() => {
    // Simulation du chargement des données
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [selectedRegion, selectedPeriod]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setIsLoading(true);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setIsLoading(true);
  };

  const exportData = () => {
    console.log("Exporting climate data...");
    // Logique d'export des données climatiques
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    if (trend === "up") {
      return <span className="text-red-500">↗</span>;
    } else if (trend === "down") {
      return <span className="text-blue-500">↘</span>;
    }
    return <span className="text-gray-500">→</span>;
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "text-red-600 dark:text-red-400";
      case "down":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("fr-FR");
  };

  if (isLoading) {
    return (
      <Base>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 dark:text-gray-400">
              Chargement des données climatiques...
            </p>
          </div>
        </div>
      </Base>
    );
  }

  return (
    <Base>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <CloudIcon className="w-8 h-8 mr-3 text-blue-600" />
              Données Climatiques
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitoring des conditions météorologiques en temps réel
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <FunnelIcon className="w-5 h-5" />
                <span className="sr-only">FunnelBtn</span>
              </button>
              <button
                onClick={() => setViewMode("chart")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "chart"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <ChartBarIcon className="w-5 h-5" />
                <span className="sr-only">ChartBarBtn</span>
              </button>
            </div>
            <button
              onClick={exportData}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapIcon className="w-5 h-5 text-gray-500" />
                <label
                  htmlFor="selected-region"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Région:
                </label>
                <select
                  id="selected-region"
                  value={selectedRegion}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <label
                  htmlFor="selected-period"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Période:
                </label>
                <select
                  id="selected-period"
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Dernière mise à jour:{" "}
              {formatTimestamp(climateData[0]?.lastUpdate)}
            </div>
          </div>
        </div>

        {/* Vue grille */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {climateData.map((data, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                      <data.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {data.parameter}
                      </h3>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {data.currentValue}
                        </span>
                        <span className="text-lg text-gray-500 dark:text-gray-400">
                          {data.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`flex items-center space-x-1 ${getTrendColor(
                        data.trend
                      )}`}
                    >
                      {getTrendIcon(data.trend)}
                      <span className="text-sm font-medium">
                        {data.change > 0 ? "+" : ""}
                        {data.change}
                        {data.unit === "%" ? "pp" : data.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Min (24h):
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {data.min24h} {data.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Max (24h):
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {data.max24h} {data.unit}
                    </span>
                  </div>

                  {/* Barre de progression pour visualiser la valeur actuelle */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>{data.min24h}</span>
                      <span>{data.max24h}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            ((data.currentValue - data.min24h) /
                              (data.max24h - data.min24h)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vue graphique */}
        {viewMode === "chart" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Évolution Temporelle - {selectedPeriod}
              </h3>
              <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="text-center">
                  <ChartBarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Graphique temporel interactif</p>
                  <p className="text-sm mt-2">
                    Région: {regions.find((r) => r.id === selectedRegion)?.name}
                  </p>
                  <p className="text-sm">
                    Période:{" "}
                    {periods.find((p) => p.id === selectedPeriod)?.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Température vs Humidité
                </h3>
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="text-center">
                    <SunIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Graphique de corrélation</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Conditions Actuelles
                </h3>
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="text-center">
                    <CloudIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Radar météorologique</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Résumé et alertes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Alert>
            <div className="flex items-start space-x-3">
              <SunIcon className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-200">
                  Conditions Météorologiques
                </h4>
                <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
                  Température élevée détectée ({climateData[0]?.currentValue}
                  °C). Restez hydraté et évitez l'exposition prolongée au
                  soleil.
                </p>
              </div>
            </div>
          </Alert>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <WindowIcon className="w-5 h-5 mr-2" />
              Conditions de Vent
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Vitesse:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {
                    climateData.find((d) => d.parameter === "Vitesse du vent")
                      ?.currentValue
                  }{" "}
                  km/h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Direction:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  Sud-Ouest
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Rafales:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  25.3 km/h
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  );
};
