import React, { useState, useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import {
  EyeIcon,
  MapPinIcon,
  ClockIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  CogIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface MonitoringStation {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  status: 'active' | 'inactive' | 'maintenance' | 'alert';
  lastUpdate: string;
  parameters: string[];
  values: Record<string, number>;
}

interface AlertItem {
  id: string;
  type: 'warning' | 'critical' | 'info';
  station: string;
  parameter: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export const MonitoringPage: React.FC = () => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [monitoringActive, setMonitoringActive] = useState(true);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // secondes

  // Données d'exemple des stations de monitoring
  const [stations, setStations] = useState<MonitoringStation[]>([
    {
      id: 'station-001',
      name: 'Station Ouagadougou Centre',
      location: 'Ouagadougou, Kadiogo',
      coordinates: [12.3714, -1.5197],
      status: 'active',
      lastUpdate: '2024-01-15T10:30:00Z',
      parameters: ['Température', 'Humidité', 'Pression', 'Précipitations'],
      values: { temperature: 32.5, humidity: 65, pressure: 1013.2, precipitation: 0 }
    },
    {
      id: 'station-002',
      name: 'Station Bobo-Dioulasso',
      location: 'Bobo-Dioulasso, Houet',
      coordinates: [11.1777, -4.2945],
      status: 'active',
      lastUpdate: '2024-01-15T10:28:00Z',
      parameters: ['Température', 'Humidité', 'Vent', 'UV'],
      values: { temperature: 29.8, humidity: 72, wind: 15.2, uv: 8.5 }
    },
    {
      id: 'station-003',
      name: 'Station Sahel Nord',
      location: 'Dori, Sahel',
      coordinates: [14.0354, -0.0348],
      status: 'alert',
      lastUpdate: '2024-01-15T09:45:00Z',
      parameters: ['Température', 'Humidité', 'Vent'],
      values: { temperature: 38.2, humidity: 25, wind: 28.5 }
    },
    {
      id: 'station-004',
      name: 'Station Gourma',
      location: 'Fada N\'Gourma, Gourma',
      coordinates: [12.0619, 0.3549],
      status: 'maintenance',
      lastUpdate: '2024-01-15T08:15:00Z',
      parameters: ['Température', 'Précipitations'],
      values: { temperature: 0, precipitation: 0 }
    }
  ]);

  // Alertes actives
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alert-001',
      type: 'critical',
      station: 'Station Sahel Nord',
      parameter: 'Température',
      message: 'Température critique détectée: 38.2°C',
      timestamp: '2024-01-15T10:25:00Z',
      acknowledged: false
    },
    {
      id: 'alert-002',
      type: 'warning',
      station: 'Station Gourma',
      parameter: 'Connexion',
      message: 'Station en maintenance programmée',
      timestamp: '2024-01-15T08:00:00Z',
      acknowledged: true
    },
    {
      id: 'alert-003',
      type: 'warning',
      station: 'Station Sahel Nord',
      parameter: 'Vent',
      message: 'Vitesse du vent élevée: 28.5 km/h',
      timestamp: '2024-01-15T10:20:00Z',
      acknowledged: false
    }
  ]);

  useEffect(() => {
    // Simulation du chargement
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Actualisation automatique des données
    if (!monitoringActive) return;

    const interval = setInterval(() => {
      console.log('Refreshing monitoring data...');
      // Ici on actualiserait les données depuis l'API
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [monitoringActive, refreshInterval]);

  const getStatusIcon = (status: MonitoringStation['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <CogIcon className="w-5 h-5 text-yellow-500" />;
      case 'alert':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: MonitoringStation['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'alert':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'critical':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  if (isLoading) {
    return (
      <Base>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 dark:text-gray-400">
              Chargement du monitoring...
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
              <EyeIcon className="w-8 h-8 mr-3 text-green-600" />
              Monitoring en Temps Réel
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Surveillance continue des stations environnementales
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Actualisation:</span>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={10}>10s</option>
                <option value={30}>30s</option>
                <option value={60}>1min</option>
                <option value={300}>5min</option>
              </select>
            </div>
            <button
              onClick={() => setMonitoringActive(!monitoringActive)}
              className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center space-x-2 ${
                monitoringActive
                  ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              {monitoringActive ? (
                <>
                  <PauseIcon className="w-4 h-4" />
                  <span>Suspendre</span>
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  <span>Reprendre</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statut général */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stations Actives</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stations.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Alertes Actives</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {alerts.filter(a => !a.acknowledged).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                <CogIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stations.filter(s => s.status === 'maintenance').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <SignalIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connectivité</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((stations.filter(s => s.status === 'active').length / stations.length) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes récentes */}
        {alerts.filter(a => !a.acknowledged).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800">
            <div className="p-6 border-b border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Alertes Non Acquittées
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {alerts.filter(a => !a.acknowledged).map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {alert.station} - {alert.parameter}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {alert.message}
                      </p>
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                      >
                        Acquitter l'alerte
                      </button>
                    </div>
                  </div>
                ))}\n              </div>
            </div>
          </div>
        )}

        {/* Liste des stations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Stations de Monitoring
            </h3>
            <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Ajouter Station</span>
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stations.map((station) => (
                <div 
                  key={station.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedStation === station.id 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedStation(selectedStation === station.id ? null : station.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {station.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {station.location}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Dernière mise à jour: {formatTimestamp(station.lastUpdate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(station.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(station.status)}`}>
                        {station.status === 'active' && 'Actif'}
                        {station.status === 'inactive' && 'Inactif'}
                        {station.status === 'maintenance' && 'Maintenance'}
                        {station.status === 'alert' && 'Alerte'}
                      </span>
                    </div>
                  </div>

                  {/* Données détaillées */}
                  {selectedStation === station.id && station.status === 'active' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Mesures Actuelles
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(station.values).map(([param, value]) => (
                          <div key={param} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                              {param === 'temperature' && 'Température'}
                              {param === 'humidity' && 'Humidité'}
                              {param === 'pressure' && 'Pression'}
                              {param === 'precipitation' && 'Précipitations'}
                              {param === 'wind' && 'Vent'}
                              {param === 'uv' && 'UV'}
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {value}
                              {param === 'temperature' && '°C'}
                              {param === 'humidity' && '%'}
                              {param === 'pressure' && ' hPa'}
                              {param === 'precipitation' && ' mm'}
                              {param === 'wind' && ' km/h'}
                              {param === 'uv' && ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Statut du monitoring */}
        <Alert>
          <div className="flex items-start space-x-3">
            <SignalIcon className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-200">
                Monitoring {monitoringActive ? 'Actif' : 'Suspendu'}
              </h4>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                {monitoringActive 
                  ? `Actualisation automatique toutes les ${refreshInterval} secondes. ${stations.filter(s => s.status === 'active').length} stations en fonctionnement.`
                  : 'Le monitoring est actuellement suspendu. Cliquez sur "Reprendre" pour relancer la surveillance.'
                }
              </p>
            </div>
          </div>
        </Alert>
      </div>
    </Base>
  );
};