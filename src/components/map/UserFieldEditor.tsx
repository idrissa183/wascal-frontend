import React, { useState, useEffect } from "react";
import {
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { MapPin, Square, Circle, Save } from "lucide-react";
import { PiPolygonBold } from "react-icons/pi";
import { useUserFieldsStore } from "../../stores/useUserFieldsStore";

interface UserFieldEditorProps {
  pendingGeometry?: any;
  pendingGeometryType?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  editingField?: any;
  className?: string;
}

export const UserFieldEditor: React.FC<UserFieldEditorProps> = ({
  pendingGeometry,
  pendingGeometryType,
  onSave,
  onCancel,
  editingField,
  className = "",
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    visibility: "public",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createUserField, updateUserField, deleteUserField } = useUserFieldsStore();

  // Initialize form data when editing
  useEffect(() => {
    if (editingField) {
      setFormData({
        name: editingField.name || "",
        description: editingField.description || "",
        category: editingField.category || "general",
        visibility: editingField.visibility || "public",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "general",
        visibility: "public",
      });
    }
  }, [editingField]);

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

  const getGeometryLabel = (type: string) => {
    switch (type) {
      case "point":
        return "Point";
      case "polygon":
        return "Polygone";
      case "circle":
        return "Cercle";
      case "rectangle":
        return "Rectangle";
      default:
        return type;
    }
  };

  const calculateArea = (geometry: any, type: string) => {
    if (!geometry) return null;
    
    // This is a simplified calculation - you might want to use a proper geometry library
    if (type === "circle" && geometry.radius) {
      const area = Math.PI * Math.pow(geometry.radius, 2);
      return (area / 1000000).toFixed(2); // Convert to km²
    }
    
    // For other geometries, you'd need to implement proper area calculation
    return null;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }
    
    if (formData.name.length > 50) {
      newErrors.name = "Le nom ne peut pas dépasser 50 caractères";
    }
    
    if (formData.description.length > 500) {
      newErrors.description = "La description ne peut pas dépasser 500 caractères";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const data = {
        ...formData,
        geometry: pendingGeometry,
        geometry_type: pendingGeometryType as "circle" | "polygon" | "point" | "rectangle",
      };
      
      if (editingField) {
        await updateUserField(editingField.id, data);
      } else {
        await createUserField(data);
      }
      
      if (onSave) {
        onSave(data);
      }
    } catch (error) {
      console.error("Error saving user field:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingField) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce champ ?")) {
      try {
        await deleteUserField(editingField.id);
        if (onCancel) {
          onCancel();
        }
      } catch (error) {
        console.error("Error deleting user field:", error);
      }
    }
  };

  const geometryType = pendingGeometryType || editingField?.geometry_type;
  const GeometryIcon = getGeometryIcon(geometryType);
  const area = calculateArea(pendingGeometry || editingField?.geometry, geometryType);

  return (
    <div className={`bg-white dark:bg-gray-800 ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {GeometryIcon && <GeometryIcon className="w-5 h-5 text-blue-600" />}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingField ? "Modifier le champ" : "Nouveau champ"}
            </h3>
          </div>
          
          {onCancel && (
            <button
              type="button"
              aria-label="Annuler"
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Geometry Info */}
        {geometryType && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Type de géométrie
                </span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {getGeometryLabel(geometryType)}
                </p>
              </div>
              
              {area && (
                <div className="text-right">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Superficie
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {area} km²
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name
                  ? "border-red-300 dark:border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              placeholder="Nom du champ"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description
                  ? "border-red-300 dark:border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              placeholder="Description optionnelle"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Catégorie
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="general">Général</option>
              <option value="agriculture">Agriculture</option>
              <option value="environment">Environnement</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="research">Recherche</option>
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Visibilité
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="public">Public</option>
              <option value="private">Privé</option>
              <option value="shared">Partagé</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Sauvegarde..." : "Sauvegarder"}</span>
            </button>
            
            {editingField && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};