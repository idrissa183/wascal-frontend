import React, { useState } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import SidebarNew from "../include/SidebarNew";
import MapContainerNew from "./MapContainerNew";
import type { GeographicFilter, MapSelection } from "../../types/map";

interface GeographicFilters {
  datasets: string[];
  categories: string[];
  pays: number[];
  regions: number[];
  provinces: number[];
  departments: number[];
}

export default function MapPageNew() {
  const t = useTranslations();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [geographicFilters, setGeographicFilters] = useState<GeographicFilters>({
    datasets: [],
    categories: [],
    pays: [],
    regions: [],
    provinces: [],
    departments: [],
  });
  const [mapSelection, setMapSelection] = useState<MapSelection | null>(null);

  const handleFiltersChange = (filters: GeographicFilters) => {
    setGeographicFilters(filters);
    console.log('Nouveaux filtres géographiques:', filters);
  };

  const handleSelectionChange = (selection: MapSelection) => {
    setMapSelection(selection);
    console.log('Nouvelle sélection sur la carte:', selection);
  };

  const handleLayerChange = (layers: string[]) => {
    console.log('Couches actives:', layers);
  };

  // Convertir les filtres au format attendu par MapContainer
  const mapFilters: GeographicFilter = {
    countries: geographicFilters.pays,
    regions: geographicFilters.regions,
    provinces: geographicFilters.provinces,
    departments: geographicFilters.departments,
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <SidebarNew
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onFiltersChange={handleFiltersChange}
      />

      {/* Contenu principal */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white lg:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.map || "Carte"}
              </h1>
            </div>

            {/* Indicateurs de filtres actifs */}
            <div className="flex items-center space-x-4">
              {Object.values(mapFilters).some(arr => arr.length > 0) && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                    {Object.values(mapFilters).reduce((sum, arr) => sum + arr.length, 0)} filtres actifs
                  </span>
                </div>
              )}
              
              {mapSelection && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    Sélection: {mapSelection.type}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenu de la carte */}
        <main className="h-full">
          <div className="h-full p-6">
            <div className="h-full rounded-lg overflow-hidden shadow-lg">
              <MapContainerNew
                geographicFilters={mapFilters}
                onSelectionChange={handleSelectionChange}
                onLayerChange={handleLayerChange}
                className="h-full"
              />
            </div>
          </div>
        </main>
      </div>

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}