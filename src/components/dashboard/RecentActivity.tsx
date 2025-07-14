import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import {
  MapPinIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CloudIcon
} from '@heroicons/react/24/outline';

export default function RecentActivity() {
  const { language } = useLanguage();

  const translations = {
    fr: {
      recentActivity: 'Activité récente',
      viewAll: 'Voir tout',
      newDataAnalysis: 'Nouvelle analyse de données',
      alertGenerated: 'Alerte générée',
      predictionCompleted: 'Prédiction terminée',
      areaMonitored: 'Zone surveillée',
      minutes: 'min',
      hours: 'h',
      days: 'j',
      ago: 'il y a'
    },
    en: {
      recentActivity: 'Recent Activity',
      viewAll: 'View All',
      newDataAnalysis: 'New data analysis',
      alertGenerated: 'Alert generated',
      predictionCompleted: 'Prediction completed',
      areaMonitored: 'Area monitored',
      minutes: 'min',
      hours: 'h',
      days: 'd',
      ago: 'ago'
    }
  };

  const t = translations[language];

  const activities = [
    {
      id: 1,
      type: 'analysis',
      title: t.newDataAnalysis,
      description: 'NDVI analysis for Ouagadougou region',
      time: '5',
      timeUnit: t.minutes,
      icon: ChartBarIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      id: 2,
      type: 'alert',
      title: t.alertGenerated,
      description: 'High temperature detected in Zone A',
      time: '12',
      timeUnit: t.minutes,
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      id: 3,
      type: 'prediction',
      title: t.predictionCompleted,
      description: 'Rainfall prediction for next 7 days',
      time: '1',
      timeUnit: t.hours,
      icon: CloudIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 4,
      type: 'monitoring',
      title: t.areaMonitored,
      description: 'New monitoring zone added: Bobo-Dioulasso',
      time: '2',
      timeUnit: t.hours,
      icon: MapPinIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.recentActivity}
          </h3>
          <button className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
            {t.viewAll}
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${activity.bgColor} dark:bg-opacity-20`}>
                <activity.icon className={`w-5 h-5 ${activity.color} dark:text-opacity-80`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t.ago} {activity.time} {activity.timeUnit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}