import React from 'react';
import { useTranslations } from '../../hooks/useTranslations';
import MapContainer from './MapContainer';

const MapPage: React.FC = () => {
  const t = useTranslations();

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.map}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.map_description}
        </p>
      </div>
      
      <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <MapContainer />
      </div>
    </div>
  );
};

export default MapPage;