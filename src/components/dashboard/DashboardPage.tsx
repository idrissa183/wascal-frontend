import React from 'react';
import Base from '../layout/Base';
import { useTranslations } from '../../hooks/useTranslations';
import { useAuthStore } from '../../stores/useAuthStore';
import { 
  ChartBarIcon, 
  MapIcon, 
  CloudIcon, 
  EyeIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export const DashboardPage: React.FC = () => {
  const t = useTranslations();
  const { user } = useAuthStore();

  const cards = [
    {
      title: t.map || 'Interactive Map',
      description: 'Explore environmental data on an interactive map',
      icon: MapIcon,
      href: '/map',
      color: 'bg-blue-500'
    },
    {
      title: t.analytics || 'Analytics',
      description: 'View detailed analytics and reports',
      icon: ChartBarIcon,
      href: '/analytics',
      color: 'bg-green-500'
    },
    {
      title: t.monitoring || 'Monitoring',
      description: 'Monitor environmental conditions in real-time',
      icon: EyeIcon,
      href: '/monitoring',
      color: 'bg-purple-500'
    },
    {
      title: t.climate || 'Climate Data',
      description: 'Access climate and weather information',
      icon: CloudIcon,
      href: '/data/climate',
      color: 'bg-orange-500'
    },
    {
      title: t.predictions || 'Predictions',
      description: 'View AI-powered environmental predictions',
      icon: ArrowTrendingUpIcon,
      href: '/predictions',
      color: 'bg-indigo-500'
    },
    {
      title: t.datasets || 'Datasets',
      description: 'Browse and manage environmental datasets',
      icon: GlobeAltIcon,
      href: '/datasets',
      color: 'bg-teal-500'
    }
  ];

  const handleCardClick = (href: string) => {
    window.location.href = href;
  };

  return (
    <Base>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.dashboard || 'Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.firstname || user?.email || 'User'}! Monitor and analyze environmental data from across West Africa.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Active Regions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      14
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CloudIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Data Sources
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      12
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Reports Generated
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      24
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <EyeIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
                      Monitoring Points
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      156
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(card.href)}
              className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${card.color} group-hover:scale-110 transition-transform`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Recent Activity
              </h3>
              <div className="mt-5">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Climate data updated for Burkina Faso region
                    </p>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      New precipitation data available
                    </p>
                    <span className="text-xs text-gray-400">4 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Alert: Temperature anomaly detected in Niger
                    </p>
                    <span className="text-xs text-gray-400">6 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </Base>
  );
};

export default DashboardPage;