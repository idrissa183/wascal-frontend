import React, { useState, useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import {
  CloudIcon,
  SunIcon,
  EyeDropperIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  WindowIcon,
} from "@heroicons/react/24/outline";

interface WeatherStation {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  currentWeather: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: string;
    precipitation: number;
    uvIndex: number;
    visibility: number;
    condition: string;
  };
  forecast: WeatherForecast[];
  lastUpdate: string;
}

interface WeatherForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

export const WeatherPage: React.FC = () => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState("station-001");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Données d'exemple des stations météo
  const [weatherStations] = useState<WeatherStation[]>([
    {
      id: "station-001",
      name: "Ouagadougou Centre",
      location: "Ouagadougou, Kadiogo",
      coordinates: [12.3714, -1.5197],
      currentWeather: {
        temperature: 32.5,
        humidity: 65,
        pressure: 1013.2,
        windSpeed: 15.2,
        windDirection: "SO",
        precipitation: 0,
        uvIndex: 8.5,
        visibility: 10,
        condition: "Ensoleillé",
      },
      forecast: [
        {
          date: "2024-01-16",
          tempMin: 24,
          tempMax: 35,
          humidity: 60,
          precipitation: 0,
          windSpeed: 12,
          condition: "Ensoleillé",
          icon: "☀️",
        },
        {
          date: "2024-01-17",
          tempMin: 25,
          tempMax: 36,
          humidity: 58,
          precipitation: 0,
          windSpeed: 14,
          condition: "Partiellement nuageux",
          icon: "⛅",
        },
        {
          date: "2024-01-18",
          tempMin: 23,
          tempMax: 33,
          humidity: 72,
          precipitation: 5,
          windSpeed: 18,
          condition: "Averses",
          icon: "🌦️",
        },
        {
          date: "2024-01-19",
          tempMin: 22,
          tempMax: 31,
          humidity: 75,
          precipitation: 12,
          windSpeed: 16,
          condition: "Pluie",
          icon: "🌧️",
        },
        {
          date: "2024-01-20",
          tempMin: 24,
          tempMax: 34,
          humidity: 68,
          precipitation: 2,
          windSpeed: 13,
          condition: "Nuageux",
          icon: "☁️",
        },
      ],
      lastUpdate: "2024-01-15T10:30:00Z",
    },
    {
      id: "station-002",
      name: "Bobo-Dioulasso",
      location: "Bobo-Dioulasso, Houet",
      coordinates: [11.1777, -4.2945],
      currentWeather: {
        temperature: 29.8,
        humidity: 72,
        pressure: 1015.1,
        windSpeed: 8.5,
        windDirection: "O",
        precipitation: 0,
        uvIndex: 7.2,
        visibility: 12,
        condition: "Partiellement nuageux",
      },
      forecast: [],
      lastUpdate: "2024-01-15T10:28:00Z",
    },
    {
      id: "station-003",
      name: "Dori",
      location: "Dori, Sahel",
      coordinates: [14.0354, -0.0348],
      currentWeather: {
        temperature: 38.2,
        humidity: 25,
        pressure: 1009.8,
        windSpeed: 28.5,
        windDirection: "NE",
        precipitation: 0,
        uvIndex: 11.2,
        visibility: 8,
        condition: "Ensoleillé et venteux",
      },
      forecast: [],
      lastUpdate: "2024-01-15T10:25:00Z",
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastRefresh(new Date());
      console.log("Refreshing weather data...");
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const selectedStationData = weatherStations.find(
    (station) => station.id === selectedStation
  );

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const getUVLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: "Faible", color: "text-green-600" };
    if (uvIndex <= 5) return { level: "Modéré", color: "text-yellow-600" };
    if (uvIndex <= 7) return { level: "Élevé", color: "text-orange-600" };
    if (uvIndex <= 10) return { level: "Très élevé", color: "text-red-600" };
    return { level: "Extrême", color: "text-purple-600" };
  };

  if (isLoading) {
    return (
      <Base>
        <div className="responsive-loading">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Chargement des données météo...
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
              <CloudIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600" />
              Météorologie
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Conditions météorologiques en temps réel et prévisions
            </p>
          </div>
          <div className="responsive-flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="selected-station"
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                Station:
              </label>
              <select
                id="selected-station"
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {weatherStations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`responsive-button flex items-center space-x-2 ${
                autoRefresh
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">
                {autoRefresh ? "Auto" : "Manuel"}
              </span>
            </button>
          </div>
        </div>

        {selectedStationData && (
          <>
            {/* Conditions actuelles */}
            <div className="responsive-card bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg">
              <div className="responsive-flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPinIcon className="w-5 h-5" />
                    <h2 className="text-lg sm:text-xl font-semibold">
                      {selectedStationData.name}
                    </h2>
                  </div>
                  <p className="text-blue-100 text-sm">
                    {selectedStationData.location}
                  </p>
                  <p className="text-blue-100 text-xs mt-1">
                    Dernière mise à jour:{" "}
                    {formatTime(selectedStationData.lastUpdate)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-6xl font-bold">
                    {selectedStationData.currentWeather.temperature}°
                  </div>
                  <div className="text-blue-100 text-sm sm:text-base">
                    {selectedStationData.currentWeather.condition}
                  </div>
                </div>
              </div>
            </div>

            {/* Détails météorologiques */}
            <div className="responsive-grid">
              <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <EyeDropperIcon className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Humidité
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStationData.currentWeather.humidity}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <WindowIcon className="w-8 h-8 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Vent
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStationData.currentWeather.windSpeed} km/h
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedStationData.currentWeather.windDirection}
                    </p>
                  </div>
                </div>
              </div>

              <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <CloudIcon className="w-8 h-8 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pression
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStationData.currentWeather.pressure}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      hPa
                    </p>
                  </div>
                </div>
              </div>

              <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <SunIcon className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Index UV
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStationData.currentWeather.uvIndex}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        getUVLevel(selectedStationData.currentWeather.uvIndex)
                          .color
                      }`}
                    >
                      {
                        getUVLevel(selectedStationData.currentWeather.uvIndex)
                          .level
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prévisions */}
            {selectedStationData.forecast.length > 0 && (
              <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="responsive-padding border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    Prévisions 5 jours
                  </h3>
                </div>
                <div className="responsive-padding">
                  <div className="responsive-overflow">
                    <div className="flex space-x-4 pb-2">
                      {selectedStationData.forecast.map((forecast, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg min-w-[120px]"
                        >
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            {formatDate(forecast.date)}
                          </div>
                          <div className="text-2xl mb-2">{forecast.icon}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {forecast.condition}
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {forecast.tempMax}°
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {forecast.tempMin}°
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              💧 {forecast.precipitation}mm
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              💨 {forecast.windSpeed}km/h
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alertes météo */}
            {selectedStationData.currentWeather.temperature > 35 && (
              <Alert variant="warning">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900 dark:text-orange-200">
                      Alerte Température Élevée
                    </h4>
                    <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
                      Température critique détectée (
                      {selectedStationData.currentWeather.temperature}°C).
                      Évitez l'exposition prolongée au soleil et restez hydraté.
                    </p>
                  </div>
                </div>
              </Alert>
            )}

            {selectedStationData.currentWeather.windSpeed > 25 && (
              <Alert variant="warning">
                <div className="flex items-start space-x-3">
                  <WindowIcon className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-900 dark:text-orange-200">
                      Alerte Vent Fort
                    </h4>
                    <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
                      Vents forts détectés (
                      {selectedStationData.currentWeather.windSpeed} km/h).
                      Soyez prudent lors de vos déplacements.
                    </p>
                  </div>
                </div>
              </Alert>
            )}
          </>
        )}

        {/* Toutes les stations */}
        <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="responsive-padding border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Toutes les Stations
            </h3>
          </div>
          <div className="responsive-padding">
            <div className="responsive-grid">
              {weatherStations.map((station) => (
                <div
                  key={station.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedStation === station.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  onClick={() => setSelectedStation(station.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {station.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {station.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {station.currentWeather.temperature}°C
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {station.currentWeather.condition}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <EyeDropperIcon className="w-3 h-3 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {station.currentWeather.humidity}%
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <WindowIcon className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {station.currentWeather.windSpeed} km/h
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CloudIcon className="w-3 h-3 text-gray-600" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {station.currentWeather.pressure} hPa
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <SunIcon className="w-3 h-3 text-yellow-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        UV {station.currentWeather.uvIndex}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Information */}
        <Alert>
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200">
                Données météorologiques en temps réel
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                Les données sont mises à jour automatiquement toutes les 5
                minutes. Dernière actualisation:{" "}
                {formatTime(lastRefresh.toISOString())}.
              </p>
            </div>
          </div>
        </Alert>
      </div>
    </Base>
  );
};
