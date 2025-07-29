import React, { useState, useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";

interface AnalyticsData {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<{ className?: string }>;
}

export const AnalyticsPage: React.FC = () => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedMetrics, setSelectedMetrics] = useState([
    "temperature",
    "precipitation",
    "vegetation",
  ]);

  // Données d'exemple pour l'analytique
  const analyticsData: AnalyticsData[] = [
    {
      title: "Température Moyenne",
      value: "28.5°C",
      change: "+2.3%",
      trend: "up",
      icon: ChartBarIcon,
    },
    {
      title: "Précipitations",
      value: "45.2mm",
      change: "-12.5%",
      trend: "down",
      icon: ChartPieIcon,
    },
    {
      title: "NDVI Moyen",
      value: "0.45",
      change: "+5.8%",
      trend: "up",
      icon: PresentationChartLineIcon,
    },
    {
      title: "Zones Analysées",
      value: "156",
      change: "+23",
      trend: "up",
      icon: TableCellsIcon,
    },
  ];

  useEffect(() => {
    // Simulation du chargement des données
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [selectedPeriod, selectedMetrics]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setIsLoading(true);
  };

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const exportData = () => {
    console.log("Exporting analytics data...");
    // Logique d'export des données
  };

  if (isLoading) {
    return (
      <Base>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 dark:text-gray-400">
              Chargement des analyses...
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
              <ChartBarIcon className="w-8 h-8 mr-3 text-blue-600" />
              Analyses & Statistiques
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Analysez les tendances et les patterns de vos données
              environnementales
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportData}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* Filtres et contrôles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Période:
                </span>
                <select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                  <option value="90d">3 derniers mois</option>
                  <option value="1y">Dernière année</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Métriques:
                </span>
                <div className="flex space-x-2">
                  {[
                    "temperature",
                    "precipitation",
                    "vegetation",
                    "humidity",
                  ].map((metric) => (
                    <label key={metric} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric)}
                        onChange={() => handleMetricToggle(metric)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {metric === "temperature" && "Temp."}
                        {metric === "precipitation" && "Précip."}
                        {metric === "vegetation" && "Végét."}
                        {metric === "humidity" && "Humid."}
                      </span>
                    </label>
                  ))}
                  \n{" "}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsData.map((item, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {item.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {item.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowTrendingUpIcon
                      className={`w-4 h-4 mr-1 ${
                        item.trend === "up"
                          ? "text-green-500"
                          : item.trend === "down"
                          ? "text-red-500 rotate-180"
                          : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        item.trend === "up"
                          ? "text-green-600"
                          : item.trend === "down"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {item.change}
                    </span>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Graphiques et visualisations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique en courbes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Évolution Temporelle
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-center">
                <PresentationChartLineIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Graphique temporel interactif</p>
                <p className="text-sm">
                  Métriques: {selectedMetrics.join(", ")}
                </p>
              </div>
            </div>
          </div>

          {/* Graphique en secteurs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribution par Région
            </h3>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-center">
                <ChartPieIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Graphique en secteurs</p>
                <p className="text-sm">Période: {selectedPeriod}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau de données détaillées */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TableCellsIcon className="w-5 h-5 mr-2" />
              Données Détaillées
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Région
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Température
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Précipitations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      NDVI
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tendance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    {
                      region: "Centre",
                      temp: "29.2°C",
                      precip: "52.1mm",
                      ndvi: "0.48",
                      trend: "up",
                    },
                    {
                      region: "Nord",
                      temp: "31.8°C",
                      precip: "38.5mm",
                      ndvi: "0.42",
                      trend: "down",
                    },
                    {
                      region: "Sud-Ouest",
                      temp: "26.7°C",
                      precip: "68.3mm",
                      ndvi: "0.51",
                      trend: "up",
                    },
                    {
                      region: "Est",
                      temp: "28.9°C",
                      precip: "45.7mm",
                      ndvi: "0.46",
                      trend: "stable",
                    },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {row.region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {row.temp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {row.precip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {row.ndvi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.trend === "up"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : row.trend === "down"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {row.trend === "up" && "↗ Hausse"}
                          {row.trend === "down" && "↘ Baisse"}
                          {row.trend === "stable" && "→ Stable"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Message d'information */}
        <Alert>
          <div className="flex items-start space-x-3">
            <ChartBarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200">
                Analyses en temps réel
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                Les données sont mises à jour automatiquement toutes les heures.
                Utilisez les filtres pour personnaliser vos analyses selon vos
                besoins.
              </p>
            </div>
          </div>
        </Alert>
      </div>
    </Base>
  );
};
