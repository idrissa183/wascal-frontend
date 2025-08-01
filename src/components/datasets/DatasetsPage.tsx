import React, { useState, useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import {
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudIcon,
  GlobeAltIcon,
  BeakerIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface Dataset {
  id: string;
  name: string;
  description: string;
  type: "climate" | "vegetation" | "soil" | "satellite";
  source: string;
  resolution: string;
  temporalCoverage: {
    start: string;
    end: string;
  };
  spatialCoverage: string;
  size: string;
  format: string[];
  lastUpdated: string;
  downloadCount: number;
  status: "available" | "processing" | "archived";
}

export const DatasetsPage: React.FC = () => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Données d'exemple des datasets
  const [datasets] = useState<Dataset[]>([
    {
      id: "dataset-001",
      name: "Sentinel-2 Surface Reflectance",
      description: "Images satellite Sentinel-2 avec correction atmosphérique pour l'analyse de la végétation",
      type: "satellite",
      source: "Copernicus/ESA",
      resolution: "10m, 20m, 60m",
      temporalCoverage: {
        start: "2015-06-23",
        end: "2024-01-15",
      },
      spatialCoverage: "Afrique de l'Ouest",
      size: "2.5 TB",
      format: ["GeoTIFF", "NetCDF"],
      lastUpdated: "2024-01-15T10:30:00Z",
      downloadCount: 1247,
      status: "available",
    },
    {
      id: "dataset-002",
      name: "ERA5 Climate Reanalysis",
      description: "Données de réanalyse climatique ERA5 avec variables météorologiques complètes",
      type: "climate",
      source: "ECMWF",
      resolution: "0.25° x 0.25°",
      temporalCoverage: {
        start: "1979-01-01",
        end: "2024-01-15",
      },
      spatialCoverage: "Global",
      size: "850 GB",
      format: ["NetCDF", "GRIB"],
      lastUpdated: "2024-01-15T06:00:00Z",
      downloadCount: 892,
      status: "available",
    },
    {
      id: "dataset-003",
      name: "MODIS Vegetation Indices",
      description: "Indices de végétation NDVI et EVI dérivés des données MODIS",
      type: "vegetation",
      source: "NASA/USGS",
      resolution: "250m, 500m, 1km",
      temporalCoverage: {
        start: "2000-02-18",
        end: "2024-01-10",
      },
      spatialCoverage: "Afrique de l'Ouest",
      size: "1.2 TB",
      format: ["HDF", "GeoTIFF"],
      lastUpdated: "2024-01-10T12:00:00Z",
      downloadCount: 654,
      status: "available",
    },
    {
      id: "dataset-004",
      name: "CHIRPS Precipitation",
      description: "Données de précipitations CHIRPS avec résolution quotidienne",
      type: "climate",
      source: "UCSB/USGS",
      resolution: "0.05° x 0.05°",
      temporalCoverage: {
        start: "1981-01-01",
        end: "2024-01-14",
      },
      spatialCoverage: "50°N-50°S",
      size: "450 GB",
      format: ["NetCDF", "GeoTIFF"],
      lastUpdated: "2024-01-14T18:00:00Z",
      downloadCount: 1089,
      status: "available",
    },
    {
      id: "dataset-005",
      name: "SoilGrids Soil Properties",
      description: "Propriétés du sol à haute résolution dérivées de SoilGrids",
      type: "soil",
      source: "ISRIC",
      resolution: "250m",
      temporalCoverage: {
        start: "2020-01-01",
        end: "2020-12-31",
      },
      spatialCoverage: "Global",
      size: "180 GB",
      format: ["GeoTIFF"],
      lastUpdated: "2023-12-15T10:00:00Z",
      downloadCount: 234,
      status: "archived",
    },
    {
      id: "dataset-006",
      name: "Landsat 8 Surface Temperature",
      description: "Température de surface dérivée des données Landsat 8",
      type: "climate",
      source: "NASA/USGS",
      resolution: "30m",
      temporalCoverage: {
        start: "2013-04-11",
        end: "2024-01-12",
      },
      spatialCoverage: "Afrique de l'Ouest",
      size: "920 GB",
      format: ["GeoTIFF"],
      lastUpdated: "2024-01-12T14:30:00Z",
      downloadCount: 567,
      status: "processing",
    },
  ]);

  const types = [
    { id: "all", name: "Tous les types" },
    { id: "climate", name: "Climat" },
    { id: "vegetation", name: "Végétation" },
    { id: "soil", name: "Sol" },
    { id: "satellite", name: "Satellite" },
  ];

  const statuses = [
    { id: "all", name: "Tous les statuts" },
    { id: "available", name: "Disponible" },
    { id: "processing", name: "En traitement" },
    { id: "archived", name: "Archivé" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredDatasets = datasets.filter((dataset) => {
    const matchesSearch =
      dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || dataset.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || dataset.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: Dataset["type"]) => {
    switch (type) {
      case "climate":
        return <CloudIcon className="w-5 h-5 text-blue-500" />;
      case "vegetation":
        return <GlobeAltIcon className="w-5 h-5 text-green-500" />;
      case "soil":
        return <BeakerIcon className="w-5 h-5 text-orange-500" />;
      case "satellite":
        return <DocumentTextIcon className="w-5 h-5 text-purple-500" />;
    }
  };

  const getStatusColor = (status: Dataset["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  if (isLoading) {
    return (
      <Base>
        <div className="responsive-loading">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Chargement des datasets...
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
              <FolderIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-indigo-600" />
              Jeux de Données
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Catalogue des datasets environnementaux disponibles
            </p>
          </div>
          <button className="responsive-button bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center space-x-2">
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau Dataset</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>

        {/* Statistiques */}
        <div className="responsive-stats-grid">
          <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 sm:p-3 rounded-lg">
                <FolderIcon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Datasets
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {datasets.length}
                </p>
              </div>
            </div>
          </div>

          <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-green-50 dark:bg-green-900/20 p-2 sm:p-3 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Disponibles
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {datasets.filter((d) => d.status === "available").length}
                </p>
              </div>
            </div>
          </div>

          <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg">
                <ArrowDownTrayIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Téléchargements
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {datasets.reduce((sum, d) => sum + d.downloadCount, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 rounded-lg">
                <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Volume Total
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  5.8 TB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="responsive-flex items-center justify-between gap-4">
            <div className="responsive-flex items-center space-x-4">
              {/* Recherche */}
              <div className="relative flex-1 min-w-0">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un dataset..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Filtres */}
              <div className="responsive-flex items-center space-x-2">
                <FunnelIcon className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredDatasets.length} dataset{filteredDatasets.length > 1 ? "s" : ""} trouvé{filteredDatasets.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Liste des datasets */}
        <div className="responsive-grid">
          {filteredDatasets.map((dataset) => (
            <div
              key={dataset.id}
              className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  {getTypeIcon(dataset.type)}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2">
                      {dataset.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {dataset.description}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    dataset.status
                  )}`}
                >
                  {dataset.status === "available" && "Disponible"}
                  {dataset.status === "processing" && "Traitement"}
                  {dataset.status === "archived" && "Archivé"}
                </span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Source:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {dataset.source}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Résolution:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {dataset.resolution}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Période:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(dataset.temporalCoverage.start)} - {formatDate(dataset.temporalCoverage.end)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Taille:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {dataset.size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Téléchargements:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {dataset.downloadCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-3 h-3" />
                  <span>Mis à jour: {formatDate(dataset.lastUpdated)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  {dataset.status === "available" && (
                    <button className="p-1.5 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDatasets.length === 0 && (
          <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center py-12">
            <FolderIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun dataset trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Aucun dataset ne correspond aux critères de recherche.
            </p>
          </div>
        )}

        {/* Information */}
        <Alert>
          <div className="flex items-start space-x-3">
            <FolderIcon className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-indigo-900 dark:text-indigo-200">
                Catalogue de données WASCAL
              </h4>
              <p className="text-indigo-700 dark:text-indigo-300 text-sm mt-1">
                Accédez à une vaste collection de données environnementales et
                climatiques pour vos recherches et analyses.
              </p>
            </div>
          </div>
        </Alert>
      </div>
    </Base>
  );
};