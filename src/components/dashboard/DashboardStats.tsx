import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import {
  CloudIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function DashboardStats() {
  const { language } = useLanguage();

  const translations = {
    fr: {
      activeMonitoring: 'Surveillance active',
      zones: 'zones',
      dataPoints: 'Points de données',
      collected: 'collectés',
      alerts: 'Alertes',
      active: 'actives',
      predictions: 'Prédictions',
      generated: 'générées'
    },
    en: {
      activeMonitoring: 'Active Monitoring',
      zones: 'zones',
      dataPoints: 'Data Points',
      collected: 'collected',
      alerts: 'Alerts',
      active: 'active',
      predictions: 'Predictions',
      generated: 'generated'
    }
  };

  const t = translations[language];

  const stats = [
    {
      name: t.activeMonitoring,
      value: '12',
      unit: t.zones,
      icon: GlobeAltIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      change: '+2.5%',
      changeType: 'positive'
    },
    {
      name: t.dataPoints,
      value: '2.4M',
      unit: t.collected,
      icon: ChartBarIcon,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
      change: '+12.3%',
      changeType: 'positive'
    },
    {
      name: t.alerts,
      value: '8',
      unit: t.active,
      icon: ExclamationTriangleIcon,
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
      change: '-4.1%',
      changeType: 'negative'
    },
    {
      name: t.predictions,
      value: '156',
      unit: t.generated,
      icon: CloudIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+8.7%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.name}
              </p>
              <div className="flex items-baseline mt-2">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {stat.unit}
                </p>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  {language === 'fr' ? 'vs mois dernier' : 'vs last month'}
                </span>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${stat.bgColor} dark:bg-opacity-20`}>
              <stat.icon className={`w-6 h-6 ${stat.color} dark:text-opacity-80`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}