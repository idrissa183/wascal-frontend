import React, { useState, useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  role: "admin" | "user" | "researcher" | "viewer";
  status: "active" | "inactive" | "pending";
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
}

export const UsersPage: React.FC = () => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAddUser, setShowAddUser] = useState(false);

  // Données d'exemple des utilisateurs
  const [users] = useState<User[]>([
    {
      id: "user-001",
      firstname: "Jean",
      lastname: "Ouédraogo",
      email: "j.ouedraogo@wascal.org",
      phone: "+226 70 12 34 56",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-15T10:30:00Z",
      createdAt: "2023-06-15T09:00:00Z",
    },
    {
      id: "user-002",
      firstname: "Marie",
      lastname: "Kaboré",
      email: "m.kabore@wascal.org",
      phone: "+226 76 98 76 54",
      role: "researcher",
      status: "active",
      lastLogin: "2024-01-15T08:45:00Z",
      createdAt: "2023-08-20T14:30:00Z",
    },
    {
      id: "user-003",
      firstname: "Paul",
      lastname: "Sawadogo",
      email: "p.sawadogo@wascal.org",
      role: "user",
      status: "active",
      lastLogin: "2024-01-14T16:20:00Z",
      createdAt: "2023-09-10T11:15:00Z",
    },
    {
      id: "user-004",
      firstname: "Fatou",
      lastname: "Traoré",
      email: "f.traore@wascal.org",
      phone: "+226 78 45 67 89",
      role: "researcher",
      status: "pending",
      createdAt: "2024-01-10T13:45:00Z",
    },
    {
      id: "user-005",
      firstname: "Ibrahim",
      lastname: "Compaoré",
      email: "i.compaore@wascal.org",
      role: "viewer",
      status: "inactive",
      lastLogin: "2023-12-20T09:30:00Z",
      createdAt: "2023-05-05T10:00:00Z",
    },
  ]);

  const roles = [
    { id: "all", name: "Tous les rôles" },
    { id: "admin", name: "Administrateur" },
    { id: "researcher", name: "Chercheur" },
    { id: "user", name: "Utilisateur" },
    { id: "viewer", name: "Observateur" },
  ];

  const statuses = [
    { id: "all", name: "Tous les statuts" },
    { id: "active", name: "Actif" },
    { id: "inactive", name: "Inactif" },
    { id: "pending", name: "En attente" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusIcon = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "inactive":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case "pending":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  const getRoleColor = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "researcher":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "user":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "viewer":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <Base>
        <div className="responsive-loading">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Chargement des utilisateurs...
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
              <UserGroupIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600" />
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Gérer les comptes utilisateurs et leurs permissions
            </p>
          </div>
          <button
            onClick={() => setShowAddUser(true)}
            className="responsive-button bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvel Utilisateur</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>

        {/* Statistiques */}
        <div className="responsive-stats-grid">
          <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 sm:p-3 rounded-lg">
                <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Utilisateurs
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {users.length}
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
                  Actifs
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter((u) => u.status === "active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 sm:p-3 rounded-lg">
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Chercheurs
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter((u) => u.role === "researcher").length}
                </p>
              </div>
            </div>
          </div>

          <div className="responsive-card bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 sm:p-3 rounded-lg">
                <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  En attente
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {users.filter((u) => u.status === "pending").length}
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
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Filtres */}
              <div className="responsive-flex items-center space-x-2">
                <FunnelIcon className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} trouvé{filteredUsers.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="responsive-padding border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Liste des Utilisateurs
            </h3>
          </div>

          {/* Version desktop - tableau */}
          <div className="hidden lg:block responsive-overflow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {getInitials(user.firstname, user.lastname)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstname} {user.lastname}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Créé le {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role === "admin" && "Administrateur"}
                        {user.role === "researcher" && "Chercheur"}
                        {user.role === "user" && "Utilisateur"}
                        {user.role === "viewer" && "Observateur"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(user.status)}
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {user.status === "active" && "Actif"}
                          {user.status === "inactive" && "Inactif"}
                          {user.status === "pending" && "En attente"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin
                        ? formatDate(user.lastLogin)
                        : "Jamais connecté"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Version mobile - cartes */}
          <div className="lg:hidden responsive-padding">
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {getInitials(user.firstname, user.lastname)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {user.firstname} {user.lastname}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {user.role === "admin" && "Admin"}
                            {user.role === "researcher" && "Chercheur"}
                            {user.role === "user" && "Utilisateur"}
                            {user.role === "viewer" && "Observateur"}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {user.status === "active" && "Actif"}
                            {user.status === "inactive" && "Inactif"}
                            {user.status === "pending" && "En attente"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {user.phone}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Créé le {formatDate(user.createdAt)}
                      </span>
                    </div>
                    {user.lastLogin && (
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Dernière connexion: {formatDate(user.lastLogin)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="responsive-padding text-center py-12">
              <UserGroupIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucun utilisateur trouvé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Aucun utilisateur ne correspond aux critères de recherche.
              </p>
            </div>
          )}
        </div>

        {/* Information */}
        <Alert>
          <div className="flex items-start space-x-3">
            <UserGroupIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-200">
                Gestion des utilisateurs
              </h4>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                Gérez les comptes utilisateurs, leurs rôles et permissions pour
                accéder aux différentes fonctionnalités de la plateforme.
              </p>
            </div>
          </div>
        </Alert>
      </div>
    </Base>
  );
};