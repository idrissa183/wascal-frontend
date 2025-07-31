import React, { useState, useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import {
  SparklesIcon,
  ChartBarIcon,
  CalendarIcon,
  MapIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface PredictionModel {
  id: string;
  name: string;
  type: "climate" | "vegetation" | "disaster" | "yield";
  accuracy: number;
  lastTrained: string;
  status: "active" | "training" | "inactive";
  description: string;
}

interface Prediction {
  id: string;
  modelId: string;
  parameter: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  trend: "increasing" | "decreasing" | "stable";
  impact: "low" | "medium" | "high";
  unit: string;
}

export const PredictionsPage: React.FC = () => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
  const [isTraining, setIsTraining] = useState(false);

  // Modèles de prédiction disponibles
  const [models] = useState<PredictionModel[]>([
    {
      id: "climate-lstm",
      name: "Modèle Climatique LSTM",
      type: "climate",
      accuracy: 87.5,
      lastTrained: "2024-01-10T14:30:00Z",
      status: "active",
      description:
        "Prédiction des variables climatiques basée sur des réseaux LSTM",
    },
    {
      id: "vegetation-rf",
      name: "Forêt Aléatoire Végétation",
      type: "vegetation",
      accuracy: 82.3,
      lastTrained: "2024-01-12T09:15:00Z",
      status: "active",
      description:
        "Prédiction de l'évolution de la végétation (NDVI, biomasse)",
    },
    {
      id: "drought-svm",
      name: "SVM Sécheresse",
      type: "disaster",
      accuracy: 79.8,
      lastTrained: "2024-01-08T16:45:00Z",
      status: "training",
      description: "Prédiction des risques de sécheresse avec SVM",
    },
    {
      id: "yield-ensemble",
      name: "Ensemble Rendement Agricole",
      type: "yield",
      accuracy: 85.1,
      lastTrained: "2024-01-14T11:20:00Z",
      status: "active",
      description:
        "Prédiction des rendements agricoles avec modèles d'ensemble",
    },
  ]);

  // Prédictions actuelles
  const [predictions] = useState<Prediction[]>([
    {
      id: "pred-001",
      modelId: "climate-lstm",
      parameter: "Température",
      currentValue: 32.5,
      predictedValue: 35.2,
      confidence: 87,
      timeframe: "7 jours",
      trend: "increasing",
      impact: "medium",
      unit: "°C",
    },
    {
      id: "pred-002",
      modelId: "climate-lstm",
      parameter: "Précipitations",
      currentValue: 45.2,
      predictedValue: 28.7,
      confidence: 82,
      timeframe: "7 jours",
      trend: "decreasing",
      impact: "high",
      unit: "mm",
    },
    {
      id: "pred-003",
      modelId: "vegetation-rf",
      parameter: "NDVI",
      currentValue: 0.45,
      predictedValue: 0.38,
      confidence: 79,
      timeframe: "14 jours",
      trend: "decreasing",
      impact: "medium",
      unit: "",
    },
    {
      id: "pred-004",
      modelId: "drought-svm",
      parameter: "Risque Sécheresse",
      currentValue: 0.25,
      predictedValue: 0.68,
      confidence: 91,
      timeframe: "30 jours",
      trend: "increasing",
      impact: "high",
      unit: "",
    },
    {
      id: "pred-005",
      modelId: "yield-ensemble",
      parameter: "Rendement Maïs",
      currentValue: 2.8,
      predictedValue: 3.2,
      confidence: 84,
      timeframe: "90 jours",
      trend: "increasing",
      impact: "low",
      unit: "t/ha",
    },
  ]);

  const timeframes = [
    { id: "7d", name: "7 jours" },
    { id: "14d", name: "14 jours" },
    { id: "30d", name: "30 jours" },
    { id: "90d", name: "3 mois" },
    { id: "180d", name: "6 mois" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [selectedModel, selectedTimeframe]);

  const handleModelRetrain = async (modelId: string) => {
    setIsTraining(true);
    console.log(`Retraining model: ${modelId}`);

    // Simulation d'entraînement
    setTimeout(() => {
      setIsTraining(false);
      console.log("Model retrained successfully");
    }, 3000);
  };

  const getModelTypeIcon = (type: PredictionModel["type"]) => {
    switch (type) {
      case "climate":
        return "🌡️";
      case "vegetation":
        return "🌱";
      case "disaster":
        return "⚠️";
      case "yield":
        return "🌾";
      default:
        return "📊";
    }
  };

  const getStatusColor = (status: PredictionModel["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "training":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getTrendIcon = (trend: Prediction["trend"]) => {
    switch (trend) {
      case "increasing":
        return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500" />;
      case "decreasing":
        return (
          <ArrowTrendingUpIcon className="w-4 h-4 text-blue-500 rotate-180" />
        );
      case "stable":
        return <span className="text-gray-500">→</span>;
    }
  };

  const getImpactColor = (impact: Prediction["impact"]) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("fr-FR");
  };

  const filteredPredictions =
    selectedModel === "all"
      ? predictions
      : predictions.filter((p) => p.modelId === selectedModel);

  if (isLoading) {
    return (
      <Base>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 dark:text-gray-400">
              Chargement des prédictions...
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
              <SparklesIcon className="w-8 h-8 mr-3 text-purple-600" />
              Prédictions IA
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Prévisions environnementales basées sur l'intelligence
              artificielle
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() =>
                handleModelRetrain(
                  selectedModel === "all" ? models[0].id : selectedModel
                )
              }
              disabled={isTraining}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isTraining ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>Entraînement...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  <span>Ré-entraîner</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Modèle:
                </span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tous les modèles</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Horizon:
                </span>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  {timeframes.map((timeframe) => (
                    <option key={timeframe.id} value={timeframe.id}>
                      {timeframe.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modèles disponibles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CpuChipIcon className="w-5 h-5 mr-2" />
              Modèles de Prédiction
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {models.map((model) => (
                <div
                  key={model.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getModelTypeIcon(model.type)}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {model.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {model.description}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        model.status
                      )}`}
                    >
                      {model.status === "active" && "Actif"}
                      {model.status === "training" && "Entraînement"}
                      {model.status === "inactive" && "Inactif"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Précision:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {model.accuracy}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Dernier entraînement:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatTimestamp(model.lastTrained)}
                      </span>
                    </div>

                    {/* Barre de précision */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Précision</span>
                        <span>{model.accuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            model.accuracy >= 85
                              ? "bg-green-600"
                              : model.accuracy >= 75
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{ width: `${model.accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prédictions actuelles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Prédictions Actuelles
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {filteredPredictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                        <span>{prediction.parameter}</span>
                        {getTrendIcon(prediction.trend)}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Horizon: {prediction.timeframe}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(
                          prediction.impact
                        )}`}
                      >
                        Impact{" "}
                        {prediction.impact === "high"
                          ? "Élevé"
                          : prediction.impact === "medium"
                          ? "Moyen"
                          : "Faible"}
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Confiance
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {prediction.confidence}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Valeur Actuelle
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {prediction.currentValue} {prediction.unit}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                        Prédiction
                      </div>
                      <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                        {prediction.predictedValue} {prediction.unit}
                      </div>
                    </div>
                  </div>

                  {/* Visualisation de la tendance */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Évolution prédite</span>
                      <span>
                        {prediction.trend === "increasing" && "Hausse"}
                        {prediction.trend === "decreasing" && "Baisse"}
                        {prediction.trend === "stable" && "Stable"} (
                        {Math.abs(
                          ((prediction.predictedValue -
                            prediction.currentValue) /
                            prediction.currentValue) *
                            100
                        ).toFixed(1)}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          prediction.trend === "increasing"
                            ? "bg-red-500"
                            : prediction.trend === "decreasing"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertes et recommandations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Alert>
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-200">
                  Alerte Prédictive
                </h4>
                <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
                  Risque de sécheresse élevé prévu dans 30 jours (68% de
                  probabilité). Recommandation: Prévoir des mesures d'économie
                  d'eau.
                </p>
              </div>
            </div>
          </Alert>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              Recommandations
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <span className="text-green-600 text-sm">•</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Surveiller l'évolution de la végétation (NDVI en baisse
                  prévue)
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600 text-sm">•</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Préparer les systèmes d'irrigation avant la période sèche
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 text-sm">•</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Optimiser les stratégies de culture selon les prédictions de
                  rendement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Base>
  );
};
