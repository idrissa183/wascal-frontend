import React, { useState, useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import {
  FolderIcon,
  PlusIcon,
  CalendarIcon,
  UserGroupIcon,
  MapPinIcon,
  ChartBarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  region: string;
  startDate: string;
  endDate?: string;
  team: string[];
  progress: number;
}

export const ProjectsPage: React.FC = () => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [projects] = useState<Project[]>([
    {
      id: 'proj-001',
      name: 'Surveillance Climatique Sahel',
      description: 'Projet de monitoring des conditions climatiques dans la région du Sahel',
      status: 'active',
      region: 'Sahel',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      team: ['Dr. Ouédraogo', 'Prof. Kaboré', 'Ing. Sawadogo'],
      progress: 65
    },
    {
      id: 'proj-002',
      name: 'Étude Végétation Sud-Ouest',
      description: 'Analyse de l\'évolution de la végétation dans les régions du Sud-Ouest',
      status: 'active',
      region: 'Sud-Ouest',
      startDate: '2023-09-15',
      endDate: '2024-06-15',
      team: ['Dr. Traoré', 'M. Compaoré'],
      progress: 82
    },
    {
      id: 'proj-003',
      name: 'Prédiction Rendements Agricoles',
      description: 'Développement de modèles IA pour la prédiction des rendements',
      status: 'completed',
      region: 'Centre',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      team: ['Dr. Sané', 'Ing. Diallo', 'M. Barro'],
      progress: 100
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
      <Base>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 dark:text-gray-400">
              Chargement des projets...
            </p>
          </div>
        </div>
      </Base>
    );
  }

  return (
    <Base>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FolderIcon className="w-8 h-8 mr-3 text-indigo-600" />
              Gestion des Projets
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Suivi et gestion des projets de recherche environnementale
            </p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center space-x-2">
            <PlusIcon className="w-4 h-4" />
            <span>Nouveau Projet</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Projets Actifs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {projects.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chercheurs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(projects.flatMap(p => p.team)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Projets en Cours
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {projects.map((project) => (
                <div key={project.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {project.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {project.description}
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{project.region}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'En cours'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{project.team.length} membre{project.team.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status === 'active' && 'Actif'}
                      {project.status === 'completed' && 'Terminé'}
                      {project.status === 'paused' && 'En pause'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Progression</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Équipe</h5>
                    <div className="flex flex-wrap gap-2">
                      {project.team.map((member, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Alert>
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200">Collaboration WASCAL</h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                Ces projets sont menés dans le cadre du programme WASCAL pour la science climatique en Afrique de l'Ouest.
              </p>
            </div>
          </div>
        </Alert>
      </div>
    </Base>
  );
};