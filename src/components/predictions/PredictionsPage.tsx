// import React, { useState, useEffect } from "react";
// import { useTranslations } from "../../hooks/useTranslations";
// import Base from "../layout/Base";
// import { LoadingSpinner } from "../ui/LoadingSpinner";
// import { Alert } from "../ui/Alert";
// import {
//   SparklesIcon,
//   ChartBarIcon,
//   CalendarIcon,
//   MapIcon,
//   CpuChipIcon,
//   ArrowTrendingUpIcon,
//   ExclamationTriangleIcon,
//   InformationCircleIcon,
//   AdjustmentsHorizontalIcon,
//   PlayIcon,
//   ArrowPathIcon,
// } from "@heroicons/react/24/outline";

// interface PredictionModel {
//   id: string;
//   name: string;
//   type: 'climate' | 'vegetation' | 'disaster' | 'yield';
//   accuracy: number;
//   lastTrained: string;
//   status: 'active' | 'training' | 'inactive';
//   description: string;
// }

// interface Prediction {
//   id: string;
//   modelId: string;
//   parameter: string;
//   currentValue: number;
//   predictedValue: number;
//   confidence: number;
//   timeframe: string;
//   trend: 'increasing' | 'decreasing' | 'stable';
//   impact: 'low' | 'medium' | 'high';
//   unit: string;
// }

// export const PredictionsPage: React.FC = () => {
//   const t = useTranslations();
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedModel, setSelectedModel] = useState<string>('all');
//   const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
//   const [isTraining, setIsTraining] = useState(false);

//   // Modèles de prédiction disponibles
//   const [models] = useState<PredictionModel[]>([
//     {
//       id: 'climate-lstm',
//       name: 'Modèle Climatique LSTM',
//       type: 'climate',
//       accuracy: 87.5,
//       lastTrained: '2024-01-10T14:30:00Z',
//       status: 'active',
//       description: 'Prédiction des variables climatiques basée sur des réseaux LSTM'
//     },
//     {
//       id: 'vegetation-rf',
//       name: 'Forêt Aléatoire Végétation',
//       type: 'vegetation',
//       accuracy: 82.3,
//       lastTrained: '2024-01-12T09:15:00Z',
//       status: 'active',
//       description: 'Prédiction de l\'évolution de la végétation (NDVI, biomasse)'
//     },
//     {
//       id: 'drought-svm',
//       name: 'SVM Sécheresse',
//       type: 'disaster',
//       accuracy: 79.8,
//       lastTrained: '2024-01-08T16:45:00Z',
//       status: 'training',
//       description: 'Prédiction des risques de sécheresse avec SVM'
//     },
//     {
//       id: 'yield-ensemble',
//       name: 'Ensemble Rendement Agricole',
//       type: 'yield',
//       accuracy: 85.1,
//       lastTrained: '2024-01-14T11:20:00Z',
//       status: 'active',
//       description: 'Prédiction des rendements agricoles avec modèles d\'ensemble'
//     }
//   ]);

//   // Prédictions actuelles
//   const [predictions] = useState<Prediction[]>([
//     {
//       id: 'pred-001',
//       modelId: 'climate-lstm',
//       parameter: 'Température',
//       currentValue: 32.5,
//       predictedValue: 35.2,
//       confidence: 87,
//       timeframe: '7 jours',
//       trend: 'increasing',
//       impact: 'medium',
//       unit: '°C'
//     },
//     {
//       id: 'pred-002',
//       modelId: 'climate-lstm',
//       parameter: 'Précipitations',
//       currentValue: 45.2,
//       predictedValue: 28.7,
//       confidence: 82,
//       timeframe: '7 jours',
//       trend: 'decreasing',
//       impact: 'high',
//       unit: 'mm'
//     },
//     {
//       id: 'pred-003',
//       modelId: 'vegetation-rf',
//       parameter: 'NDVI',
//       currentValue: 0.45,
//       predictedValue: 0.38,
//       confidence: 79,
//       timeframe: '14 jours',
//       trend: 'decreasing',
//       impact: 'medium',
//       unit: ''
//     },
//     {
//       id: 'pred-004',
//       modelId: 'drought-svm',
//       parameter: 'Risque Sécheresse',
//       currentValue: 0.25,
//       predictedValue: 0.68,
//       confidence: 91,
//       timeframe: '30 jours',
//       trend: 'increasing',
//       impact: 'high',
//       unit: ''
//     },
//     {
//       id: 'pred-005',
//       modelId: 'yield-ensemble',
//       parameter: 'Rendement Maïs',
//       currentValue: 2.8,
//       predictedValue: 3.2,
//       confidence: 84,
//       timeframe: '90 jours',
//       trend: 'increasing',
//       impact: 'low',
//       unit: 't/ha'
//     }
//   ]);\n\n  const timeframes = [\n    { id: '7d', name: '7 jours' },\n    { id: '14d', name: '14 jours' },\n    { id: '30d', name: '30 jours' },\n    { id: '90d', name: '3 mois' },\n    { id: '180d', name: '6 mois' }\n  ];\n\n  useEffect(() => {\n    const timer = setTimeout(() => {\n      setIsLoading(false);\n    }, 1500);\n\n    return () => clearTimeout(timer);\n  }, [selectedModel, selectedTimeframe]);\n\n  const handleModelRetrain = async (modelId: string) => {\n    setIsTraining(true);\n    console.log(`Retraining model: ${modelId}`);\n    \n    // Simulation d'entraînement\n    setTimeout(() => {\n      setIsTraining(false);\n      console.log('Model retrained successfully');\n    }, 3000);\n  };\n\n  const getModelTypeIcon = (type: PredictionModel['type']) => {\n    switch (type) {\n      case 'climate': return '🌡️';\n      case 'vegetation': return '🌱';\n      case 'disaster': return '⚠️';\n      case 'yield': return '🌾';\n      default: return '📊';\n    }\n  };\n\n  const getStatusColor = (status: PredictionModel['status']) => {\n    switch (status) {\n      case 'active':\n        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';\n      case 'training':\n        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';\n      case 'inactive':\n        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';\n      default:\n        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';\n    }\n  };\n\n  const getTrendIcon = (trend: Prediction['trend']) => {\n    switch (trend) {\n      case 'increasing': return <ArrowTrendingUpIcon className=\"w-4 h-4 text-red-500\" />;\n      case 'decreasing': return <ArrowTrendingUpIcon className=\"w-4 h-4 text-blue-500 rotate-180\" />;\n      case 'stable': return <span className=\"text-gray-500\">→</span>;\n    }\n  };\n\n  const getImpactColor = (impact: Prediction['impact']) => {\n    switch (impact) {\n      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';\n      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';\n      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';\n    }\n  };\n\n  const formatTimestamp = (timestamp: string) => {\n    return new Date(timestamp).toLocaleDateString('fr-FR');\n  };\n\n  const filteredPredictions = selectedModel === 'all' \n    ? predictions \n    : predictions.filter(p => p.modelId === selectedModel);\n\n  if (isLoading) {\n    return (\n      <Base>\n        <div className=\"min-h-screen flex items-center justify-center\">\n          <div className=\"text-center space-y-4\">\n            <LoadingSpinner size=\"lg\" />\n            <p className=\"text-gray-600 dark:text-gray-400\">\n              Chargement des prédictions...\n            </p>\n          </div>\n        </div>\n      </Base>\n    );\n  }\n\n  return (\n    <Base>\n      <div className=\"space-y-6\">\n        {/* En-tête */}\n        <div className=\"flex items-center justify-between\">\n          <div>\n            <h1 className=\"text-2xl font-bold text-gray-900 dark:text-white flex items-center\">\n              <SparklesIcon className=\"w-8 h-8 mr-3 text-purple-600\" />\n              Prédictions IA\n            </h1>\n            <p className=\"text-gray-600 dark:text-gray-400 mt-1\">\n              Prévisions environnementales basées sur l'intelligence artificielle\n            </p>\n          </div>\n          <div className=\"flex items-center space-x-3\">\n            <button\n              onClick={() => handleModelRetrain(selectedModel === 'all' ? models[0].id : selectedModel)}\n              disabled={isTraining}\n              className=\"px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2\"\n            >\n              {isTraining ? (\n                <>\n                  <ArrowPathIcon className=\"w-4 h-4 animate-spin\" />\n                  <span>Entraînement...</span>\n                </>\n              ) : (\n                <>\n                  <PlayIcon className=\"w-4 h-4\" />\n                  <span>Ré-entraîner</span>\n                </>\n              )}\n            </button>\n          </div>\n        </div>\n\n        {/* Filtres */}\n        <div className=\"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6\">\n          <div className=\"flex flex-wrap items-center justify-between gap-4\">\n            <div className=\"flex items-center space-x-4\">\n              <div className=\"flex items-center space-x-2\">\n                <CpuChipIcon className=\"w-5 h-5 text-gray-500\" />\n                <span className=\"text-sm font-medium text-gray-700 dark:text-gray-300\">Modèle:</span>\n                <select\n                  value={selectedModel}\n                  onChange={(e) => setSelectedModel(e.target.value)}\n                  className=\"text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500\"\n                >\n                  <option value=\"all\">Tous les modèles</option>\n                  {models.map((model) => (\n                    <option key={model.id} value={model.id}>\n                      {model.name}\n                    </option>\n                  ))}\n                </select>\n              </div>\n              \n              <div className=\"flex items-center space-x-2\">\n                <CalendarIcon className=\"w-5 h-5 text-gray-500\" />\n                <span className=\"text-sm font-medium text-gray-700 dark:text-gray-300\">Horizon:</span>\n                <select\n                  value={selectedTimeframe}\n                  onChange={(e) => setSelectedTimeframe(e.target.value)}\n                  className=\"text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500\"\n                >\n                  {timeframes.map((timeframe) => (\n                    <option key={timeframe.id} value={timeframe.id}>\n                      {timeframe.name}\n                    </option>\n                  ))}\n                </select>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        {/* Modèles disponibles */}\n        <div className=\"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700\">\n          <div className=\"p-6 border-b border-gray-200 dark:border-gray-700\">\n            <h3 className=\"text-lg font-semibold text-gray-900 dark:text-white flex items-center\">\n              <CpuChipIcon className=\"w-5 h-5 mr-2\" />\n              Modèles de Prédiction\n            </h3>\n          </div>\n          <div className=\"p-6\">\n            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n              {models.map((model) => (\n                <div key={model.id} className=\"border border-gray-200 dark:border-gray-700 rounded-lg p-4\">\n                  <div className=\"flex items-start justify-between mb-3\">\n                    <div className=\"flex items-center space-x-3\">\n                      <span className=\"text-2xl\">{getModelTypeIcon(model.type)}</span>\n                      <div>\n                        <h4 className=\"font-medium text-gray-900 dark:text-white\">\n                          {model.name}\n                        </h4>\n                        <p className=\"text-sm text-gray-600 dark:text-gray-400\">\n                          {model.description}\n                        </p>\n                      </div>\n                    </div>\n                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>\n                      {model.status === 'active' && 'Actif'}\n                      {model.status === 'training' && 'Entraînement'}\n                      {model.status === 'inactive' && 'Inactif'}\n                    </span>\n                  </div>\n                  \n                  <div className=\"space-y-2\">\n                    <div className=\"flex justify-between text-sm\">\n                      <span className=\"text-gray-600 dark:text-gray-400\">Précision:</span>\n                      <span className=\"font-medium text-gray-900 dark:text-white\">\n                        {model.accuracy}%\n                      </span>\n                    </div>\n                    <div className=\"flex justify-between text-sm\">\n                      <span className=\"text-gray-600 dark:text-gray-400\">Dernier entraînement:</span>\n                      <span className=\"font-medium text-gray-900 dark:text-white\">\n                        {formatTimestamp(model.lastTrained)}\n                      </span>\n                    </div>\n                    \n                    {/* Barre de précision */}\n                    <div className=\"mt-3\">\n                      <div className=\"flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1\">\n                        <span>Précision</span>\n                        <span>{model.accuracy}%</span>\n                      </div>\n                      <div className=\"w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2\">\n                        <div\n                          className={`h-2 rounded-full transition-all duration-300 ${\n                            model.accuracy >= 85 ? 'bg-green-600' :\n                            model.accuracy >= 75 ? 'bg-yellow-600' : 'bg-red-600'\n                          }`}\n                          style={{ width: `${model.accuracy}%` }}\n                        ></div>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n              ))}\n            </div>\n          </div>\n        </div>\n\n        {/* Prédictions actuelles */}\n        <div className=\"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700\">\n          <div className=\"p-6 border-b border-gray-200 dark:border-gray-700\">\n            <h3 className=\"text-lg font-semibold text-gray-900 dark:text-white flex items-center\">\n              <ChartBarIcon className=\"w-5 h-5 mr-2\" />\n              Prédictions Actuelles\n            </h3>\n          </div>\n          <div className=\"p-6\">\n            <div className=\"space-y-4\">\n              {filteredPredictions.map((prediction) => (\n                <div key={prediction.id} className=\"border border-gray-200 dark:border-gray-700 rounded-lg p-4\">\n                  <div className=\"flex items-center justify-between mb-3\">\n                    <div>\n                      <h4 className=\"font-medium text-gray-900 dark:text-white flex items-center space-x-2\">\n                        <span>{prediction.parameter}</span>\n                        {getTrendIcon(prediction.trend)}\n                      </h4>\n                      <p className=\"text-sm text-gray-600 dark:text-gray-400\">\n                        Horizon: {prediction.timeframe}\n                      </p>\n                    </div>\n                    <div className=\"flex items-center space-x-3\">\n                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactColor(prediction.impact)}`}>\n                        Impact {prediction.impact === 'high' ? 'Élevé' : prediction.impact === 'medium' ? 'Moyen' : 'Faible'}\n                      </span>\n                      <div className=\"text-right\">\n                        <div className=\"text-sm text-gray-600 dark:text-gray-400\">Confiance</div>\n                        <div className=\"text-lg font-bold text-gray-900 dark:text-white\">\n                          {prediction.confidence}%\n                        </div>\n                      </div>\n                    </div>\n                  </div>\n                  \n                  <div className=\"grid grid-cols-2 gap-6\">\n                    <div className=\"text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg\">\n                      <div className=\"text-sm text-gray-600 dark:text-gray-400 mb-1\">Valeur Actuelle</div>\n                      <div className=\"text-2xl font-bold text-gray-900 dark:text-white\">\n                        {prediction.currentValue} {prediction.unit}\n                      </div>\n                    </div>\n                    <div className=\"text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg\">\n                      <div className=\"text-sm text-purple-600 dark:text-purple-400 mb-1\">Prédiction</div>\n                      <div className=\"text-2xl font-bold text-purple-900 dark:text-purple-200\">\n                        {prediction.predictedValue} {prediction.unit}\n                      </div>\n                    </div>\n                  </div>\n                  \n                  {/* Visualisation de la tendance */}\n                  <div className=\"mt-4\">\n                    <div className=\"flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2\">\n                      <span>Évolution prédite</span>\n                      <span>\n                        {prediction.trend === 'increasing' && 'Hausse'}\n                        {prediction.trend === 'decreasing' && 'Baisse'}\n                        {prediction.trend === 'stable' && 'Stable'}\n                        {' '}\n                        ({Math.abs(((prediction.predictedValue - prediction.currentValue) / prediction.currentValue) * 100).toFixed(1)}%)\n                      </span>\n                    </div>\n                    <div className=\"w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2\">\n                      <div\n                        className={`h-2 rounded-full transition-all duration-300 ${\n                          prediction.trend === 'increasing' ? 'bg-red-500' :\n                          prediction.trend === 'decreasing' ? 'bg-blue-500' : 'bg-gray-500'\n                        }`}\n                        style={{ width: `${prediction.confidence}%` }}\n                      ></div>\n                    </div>\n                  </div>\n                </div>\n              ))}\n            </div>\n          </div>\n        </div>\n\n        {/* Alertes et recommandations */}\n        <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">\n          <Alert>\n            <div className=\"flex items-start space-x-3\">\n              <ExclamationTriangleIcon className=\"w-5 h-5 text-orange-600 mt-0.5\" />\n              <div>\n                <h4 className=\"font-medium text-orange-900 dark:text-orange-200\">\n                  Alerte Prédictive\n                </h4>\n                <p className=\"text-orange-700 dark:text-orange-300 text-sm mt-1\">\n                  Risque de sécheresse élevé prévu dans 30 jours (68% de probabilité). \n                  Recommandation: Prévoir des mesures d'économie d'eau.\n                </p>\n              </div>\n            </div>\n          </Alert>\n\n          <div className=\"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6\">\n            <h3 className=\"text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center\">\n              <InformationCircleIcon className=\"w-5 h-5 mr-2\" />\n              Recommandations\n            </h3>\n            <div className=\"space-y-3\">\n              <div className=\"flex items-start space-x-2\">\n                <span className=\"text-green-600 text-sm\">•</span>\n                <p className=\"text-sm text-gray-600 dark:text-gray-400\">\n                  Surveiller l'évolution de la végétation (NDVI en baisse prévue)\n                </p>\n              </div>\n              <div className=\"flex items-start space-x-2\">\n                <span className=\"text-yellow-600 text-sm\">•</span>\n                <p className=\"text-sm text-gray-600 dark:text-gray-400\">\n                  Préparer les systèmes d'irrigation avant la période sèche\n                </p>\n              </div>\n              <div className=\"flex items-start space-x-2\">\n                <span className=\"text-blue-600 text-sm\">•</span>\n                <p className=\"text-sm text-gray-600 dark:text-gray-400\">\n                  Optimiser les stratégies de culture selon les prédictions de rendement\n                </p>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </Base>\n  );\n};