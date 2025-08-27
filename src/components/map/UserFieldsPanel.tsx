import React, { useState, useEffect } from "react";
import {
  MapPin,
  Square,
  Circle,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  Calendar,
  Ruler,
  X,
} from "lucide-react";
import { PiPolygonBold } from "react-icons/pi";
import { useUserFieldsStore } from "../../stores/useUserFieldsStore";
import { UserFieldForm } from "./UserFieldForm";
import type { UserField } from "../../services/userFields.service";
import { useTranslations } from "../../hooks/useTranslations";
import { useLanguage } from "../../hooks/useLanguage";

interface UserFieldsPanelProps {
  variant?: "floating" | "sidebar";
  isOpen?: boolean;
  onToggle?: () => void;
  onFieldVisibilityChange?: (fieldId: number, visible: boolean) => void;
  visibleFields?: Set<number>;
  onEdit?: (field: UserField) => void;
}

export function UserFieldsPanel({
  variant = "floating",
  isOpen = true,
  onToggle,
  onFieldVisibilityChange,
  visibleFields = new Set(),
  onEdit,
}: UserFieldsPanelProps) {
  const {
    userFields,
    loading,
    error,
    fetchUserFields,
    deleteUserField,
    isDrawing,
    clearError,
  } = useUserFieldsStore();
  const t = useTranslations();
  const { language } = useLanguage();

  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<UserField | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  useEffect(() => {
    fetchUserFields();
  }, [fetchUserFields]);

  const getGeometryIcon = (type: string) => {
    switch (type) {
      case "point":
        return MapPin;
      case "polygon":
        return PiPolygonBold;
      case "circle":
        return Circle;
      case "rectangle":
        return Square;
      default:
        return MapPin;
    }
  };

  const handleEdit = (field: UserField) => {
    if (onEdit) {
      onEdit(field);
    } else {
      setEditingField(field);
      setShowForm(true);
    }
    setActiveDropdown(null);
  };

  const handleDelete = async (field: UserField) => {
    if (
      window.confirm(
        t.userFieldsPanel?.confirmDelete?.replace("{0}", field.name) ||
          `Êtes-vous sûr de vouloir supprimer "${field.name}" ?`
      )
    ) {
      try {
        await deleteUserField(field.id);
        setActiveDropdown(null);
      } catch (err) {
        console.error("Error deleting field:", err);
      }
    }
  };

  const handleVisibilityToggle = (field: UserField) => {
    const isVisible = visibleFields.has(field.id);
    onFieldVisibilityChange?.(field.id, !isVisible);
    setActiveDropdown(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language);
  };

  const formatArea = (area: number | undefined) => {
    if (!area) return "N/A";
    if (area < 1) return `${(area * 1000000).toFixed(0)} m²`;
    return `${area.toFixed(2)} km²`;
  };

  if (variant !== "sidebar" && !isOpen) return null;

  const containerClasses =
    variant === "sidebar"
      ? "h-full flex flex-col"
      : "absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-40 w-80 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col";

  return (
    <>
      <div className={containerClasses}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.userFieldsPanel?.title || "Mes Champs"}
            </h3>
            {onToggle && (
              <button
                onClick={onToggle}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X />
              </button>
            )}
          </div>

          <div className="mt-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.userFieldsPanel?.instructions ||
                "Utilisez les outils de dessin à gauche pour créer une nouvelle zone. Le formulaire apparaîtra automatiquement à la fin du dessin pour vous permettre de la nommer et de l'enregistrer."}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {t.userFieldsPanel?.loading || "Chargement..."}
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={clearError}
                className="text-xs text-red-600 dark:text-red-400 hover:underline mt-1"
              >
                {t.userFieldsPanel?.close || "Fermer"}
              </button>
            </div>
          )}

          {!loading && userFields.length === 0 && (
            <div className="p-4 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {t.userFieldsPanel?.noFields || "Aucun champ créé"}
              </p>
            </div>
          )}

          <div className="space-y-2 p-4">
            {userFields.map((field) => {
              const Icon = getGeometryIcon(field.geometry_type);
              const isVisible = visibleFields.has(field.id);

              return (
                <div
                  key={field.id}
                  className="relative group bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {field.name}
                        </h4>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Ruler className="w-3 h-3" />
                          <span>{formatArea(field.area_km2)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(field.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        aria-label={
                          t.userFieldsPanel?.closePanel || "Fermer le panneau"
                        }
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === field.id ? null : field.id
                          )
                        }
                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>

                      {activeDropdown === field.id && (
                        <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 min-w-[140px]">
                          <button
                            onClick={() => handleVisibilityToggle(field)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            {isVisible ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                            {isVisible
                              ? t.userFieldsPanel?.hide || "Masquer"
                              : t.userFieldsPanel?.show || "Afficher"}
                          </button>
                          <button
                            onClick={() => handleEdit(field)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            {t.userFieldsPanel?.edit || "Modifier"}
                          </button>
                          <button
                            onClick={() => handleDelete(field)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            {t.userFieldsPanel?.delete || "Supprimer"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <UserFieldForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingField(null);
        }}
        editField={editingField}
      />

      {activeDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </>
  );
}
