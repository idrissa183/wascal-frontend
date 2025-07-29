import React, { useState, useEffect } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import Base from "../layout/Base";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Alert } from "../ui/Alert";
import {
  BellIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  FunnelIcon,
  CogIcon,
  PlusIcon,
  BellAlertIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

// Types et interfaces
interface AlertRule {
  id: string;
  name: string;
  parameter: string;
  condition: string;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

interface AlertItem {
  id: string;
  ruleId: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved";
  location: string;
  coordinates: [number, number];
  timestamp: string;
  value: number;
  threshold: number;
  unit: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

interface AlertStats {
  active: number;
  acknowledged: number;
  resolved: number;
  critical: number;
}

// Données de configuration
const SEVERITY_LEVELS = [
  { id: "all", name: "Toutes" },
  { id: "critical", name: "Critique" },
  { id: "high", name: "Élevée" },
  { id: "medium", name: "Moyenne" },
  { id: "low", name: "Faible" },
];

const STATUS_LEVELS = [
  { id: "all", name: "Tous" },
  { id: "active", name: "Actif" },
  { id: "acknowledged", name: "Acquitté" },
  { id: "resolved", name: "Résolu" },
];

// Données d'exemple
const INITIAL_ALERT_RULES: AlertRule[] = [
  {
    id: "rule-001",
    name: "Température Critique",
    parameter: "Température",
    condition: ">",
    threshold: 35,
    severity: "high",
    enabled: true,
    lastTriggered: "2024-01-15T10:25:00Z",
    triggerCount: 12,
  },
  {
    id: "rule-002",
    name: "Précipitations Faibles",
    parameter: "Précipitations",
    condition: "<",
    threshold: 10,
    severity: "medium",
    enabled: true,
    lastTriggered: "2024-01-14T08:30:00Z",
    triggerCount: 5,
  },
  {
    id: "rule-003",
    name: "NDVI Critique",
    parameter: "NDVI",
    condition: "<",
    threshold: 0.3,
    severity: "critical",
    enabled: true,
    triggerCount: 0,
  },
  {
    id: "rule-004",
    name: "Vent Violent",
    parameter: "Vitesse du vent",
    condition: ">",
    threshold: 50,
    severity: "high",
    enabled: false,
    triggerCount: 2,
  },
  {
    id: "rule-005",
    name: "Humidité Faible",
    parameter: "Humidité",
    condition: "<",
    threshold: 30,
    severity: "low",
    enabled: true,
    lastTriggered: "2024-01-13T15:45:00Z",
    triggerCount: 8,
  },
];

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: "alert-001",
    ruleId: "rule-001",
    title: "Température critique détectée",
    message:
      "La température a dépassé le seuil critique dans la région de Ouagadougou",
    severity: "high",
    status: "active",
    location: "Ouagadougou, Centre",
    coordinates: [12.3714, -1.5197],
    timestamp: "2024-01-15T10:25:00Z",
    value: 38.2,
    threshold: 35,
    unit: "°C",
  },
  {
    id: "alert-002",
    ruleId: "rule-002",
    title: "Précipitations insuffisantes",
    message: "Niveau de précipitations critique dans la région du Sahel",
    severity: "medium",
    status: "acknowledged",
    location: "Dori, Sahel",
    coordinates: [14.0354, -0.0348],
    timestamp: "2024-01-14T08:30:00Z",
    value: 5.2,
    threshold: 10,
    unit: "mm",
    acknowledgedBy: "Admin User",
    acknowledgedAt: "2024-01-14T09:15:00Z",
  },
  {
    id: "alert-003",
    ruleId: "rule-005",
    title: "Humidité faible détectée",
    message: "Taux d'humidité en dessous du seuil acceptable",
    severity: "low",
    status: "resolved",
    location: "Bobo-Dioulasso, Houet",
    coordinates: [11.1777, -4.2945],
    timestamp: "2024-01-13T15:45:00Z",
    value: 28,
    threshold: 30,
    unit: "%",
    acknowledgedBy: "Tech User",
    acknowledgedAt: "2024-01-13T16:00:00Z",
    resolvedAt: "2024-01-14T10:30:00Z",
  },
  {
    id: "alert-004",
    ruleId: "rule-001",
    title: "Température élevée persistante",
    message: "Température élevée maintenue pendant plus de 4 heures",
    severity: "critical",
    status: "active",
    location: "Fada N'Gourma, Gourma",
    coordinates: [12.0619, 0.3549],
    timestamp: "2024-01-15T07:20:00Z",
    value: 39.8,
    threshold: 35,
    unit: "°C",
  },
];

// Utilitaires
const getSeverityIcon = (
  severity: AlertItem["severity"]
): React.ReactElement => {
  switch (severity) {
    case "critical":
      return <XCircleIcon className="w-5 h-5 text-red-600" />;
    case "high":
      return <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />;
    case "medium":
      return <InformationCircleIcon className="w-5 h-5 text-yellow-600" />;
    case "low":
      return <CheckCircleIcon className="w-5 h-5 text-blue-600" />;
  }
};

const getSeverityColor = (severity: AlertItem["severity"]): string => {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800";
    case "low":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800";
  }
};

const getStatusColor = (status: AlertItem["status"]): string => {
  switch (status) {
    case "active":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "acknowledged":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "resolved":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  }
};

const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString("fr-FR");
};

// Composants
const StatsCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  color: string;
}> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center">
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

const FilterPanel: React.FC<{
  selectedSeverity: string;
  selectedStatus: string;
  onSeverityChange: (severity: string) => void;
  onStatusChange: (status: string) => void;
  alertCount: number;
}> = ({
  selectedSeverity,
  selectedStatus,
  onSeverityChange,
  onStatusChange,
  alertCount,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Gravité:
          </span>
          <select
            value={selectedSeverity}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
          >
            {SEVERITY_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <ClockIcon className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Statut:
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
          >
            {STATUS_LEVELS.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        {alertCount} alerte{alertCount > 1 ? "s" : ""} trouvée
        {alertCount > 1 ? "s" : ""}
      </div>
    </div>
  </div>
);

const RulesPanel: React.FC<{
  rules: AlertRule[];
  showRules: boolean;
  onToggleRules: () => void;
  onToggleRule: (ruleId: string) => void;
}> = ({ rules, showRules, onToggleRules, onToggleRule }) => {
  if (!showRules) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <CogIcon className="w-5 h-5 mr-2" />
            Règles d'Alerte
          </h3>
          <button
            onClick={onToggleRules}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <ChevronUpIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onToggleRule(rule.id)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {rule.enabled ? (
                    <EyeIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {rule.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {rule.parameter} {rule.condition} {rule.threshold}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                    rule.severity
                  )
                    .split(" ")
                    .slice(0, 2)
                    .join(" ")}`}
                >
                  {rule.severity === "critical" && "Critique"}
                  {rule.severity === "high" && "Élevée"}
                  {rule.severity === "medium" && "Moyenne"}
                  {rule.severity === "low" && "Faible"}
                </span>
                <div className="text-right text-sm">
                  <div className="text-gray-900 dark:text-white font-medium">
                    {rule.triggerCount} déclenchement
                    {rule.triggerCount > 1 ? "s" : ""}
                  </div>
                  {rule.lastTriggered && (
                    <div className="text-gray-500 dark:text-gray-400">
                      {formatTimestamp(rule.lastTriggered)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AlertCard: React.FC<{
  alert: AlertItem;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}> = ({ alert, onAcknowledge, onResolve }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 ${getSeverityColor(
      alert.severity
    )}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-4">
        {getSeverityIcon(alert.severity)}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {alert.title}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                alert.status
              )}`}
            >
              {alert.status === "active" && "Actif"}
              {alert.status === "acknowledged" && "Acquitté"}
              {alert.status === "resolved" && "Résolu"}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {alert.message}
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <MapPinIcon className="w-4 h-4" />
              <span>{alert.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{formatTimestamp(alert.timestamp)}</span>
            </div>
            <div className="font-medium">
              Valeur: {alert.value} {alert.unit} (seuil: {alert.threshold}{" "}
              {alert.unit})
            </div>
          </div>

          {/* Informations d'acquittement/résolution */}
          {alert.acknowledgedBy && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Acquitté par {alert.acknowledgedBy} le{" "}
              {formatTimestamp(alert.acknowledgedAt!)}
              {alert.resolvedAt && (
                <span> • Résolu le {formatTimestamp(alert.resolvedAt)}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {alert.status === "active" && (
          <>
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700 dark:hover:bg-yellow-800"
            >
              Acquitter
            </button>
            <button
              onClick={() => onResolve(alert.id)}
              className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-900 dark:text-green-200 dark:border-green-700 dark:hover:bg-green-800"
            >
              Résoudre
            </button>
          </>
        )}
        {alert.status === "acknowledged" && (
          <button
            onClick={() => onResolve(alert.id)}
            className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-green-900 dark:text-green-200 dark:border-green-700 dark:hover:bg-green-800"
          >
            Résoudre
          </button>
        )}
      </div>
    </div>
  </div>
);

// Composant principal
export const AlertsPage: React.FC = () => {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showRules, setShowRules] = useState(false);
  const [alertRules, setAlertRules] =
    useState<AlertRule[]>(INITIAL_ALERT_RULES);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedSeverity, selectedStatus]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "acknowledged",
              acknowledgedBy: "Current User",
              acknowledgedAt: new Date().toISOString(),
            }
          : alert
      )
    );
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              status: "resolved",
              resolvedAt: new Date().toISOString(),
            }
          : alert
      )
    );
  };

  const toggleRule = (ruleId: string) => {
    setAlertRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    const severityMatch =
      selectedSeverity === "all" || alert.severity === selectedSeverity;
    const statusMatch =
      selectedStatus === "all" || alert.status === selectedStatus;
    return severityMatch && statusMatch;
  });

  const getAlertStats = (): AlertStats => {
    const active = alerts.filter((a) => a.status === "active").length;
    const acknowledged = alerts.filter(
      (a) => a.status === "acknowledged"
    ).length;
    const resolved = alerts.filter((a) => a.status === "resolved").length;
    const critical = alerts.filter(
      (a) => a.severity === "critical" && a.status === "active"
    ).length;

    return { active, acknowledged, resolved, critical };
  };

  const stats = getAlertStats();

  if (isLoading) {
    return (
      <Base>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 dark:text-gray-400">
              Chargement des alertes...
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
              <BellIcon className="w-8 h-8 mr-3 text-red-600" />
              Système d'Alertes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestion et surveillance des alertes environnementales
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowRules(!showRules)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <CogIcon className="w-4 h-4" />
              <span>Règles</span>
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center space-x-2">
              <PlusIcon className="w-4 h-4" />
              <span>Nouvelle Alerte</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            icon={BellAlertIcon}
            title="Alertes Actives"
            value={stats.active}
            color="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          />
          <StatsCard
            icon={EyeIcon}
            title="Acquittées"
            value={stats.acknowledged}
            color="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
          />
          <StatsCard
            icon={CheckCircleIcon}
            title="Résolues"
            value={stats.resolved}
            color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          />
          <StatsCard
            icon={XCircleIcon}
            title="Critiques"
            value={stats.critical}
            color="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
          />
        </div>

        {/* Filtres */}
        <FilterPanel
          selectedSeverity={selectedSeverity}
          selectedStatus={selectedStatus}
          onSeverityChange={setSelectedSeverity}
          onStatusChange={setSelectedStatus}
          alertCount={filteredAlerts.length}
        />

        {/* Règles d'alerte */}
        <RulesPanel
          rules={alertRules}
          showRules={showRules}
          onToggleRules={() => setShowRules(!showRules)}
          onToggleRule={toggleRule}
        />

        {/* Liste des alertes */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
              <div className="text-center">
                <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucune alerte trouvée
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Aucune alerte ne correspond aux critères sélectionnés.
                </p>
              </div>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={acknowledgeAlert}
                onResolve={resolveAlert}
              />
            ))
          )}
        </div>

        {/* Résumé et conseils */}
        {stats.active > 0 && (
          <Alert>
            <div className="flex items-start space-x-3">
              <BellAlertIcon className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-200">
                  {stats.active} Alerte{stats.active > 1 ? "s" : ""} Active
                  {stats.active > 1 ? "s" : ""}
                </h4>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                  {stats.critical > 0 &&
                    `${stats.critical} alerte${
                      stats.critical > 1 ? "s" : ""
                    } critique${stats.critical > 1 ? "s" : ""} nécessite${
                      stats.critical === 1 ? "" : "nt"
                    } une attention immédiate. `}
                  Vérifiez les conditions sur le terrain et prenez les mesures
                  appropriées.
                </p>
              </div>
            </div>
          </Alert>
        )}
      </div>
    </Base>
  );
};
