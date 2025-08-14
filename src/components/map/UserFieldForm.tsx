import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useUserFieldsStore } from '../../stores/useUserFieldsStore';
import type { UserField } from '../../services/userFields.service';

interface UserFieldFormProps {
  isOpen: boolean;
  onClose: () => void;
  editField?: UserField | null;
  geometry?: any;
  geometryType?: 'point' | 'polygon' | 'circle' | 'rectangle';
}

export function UserFieldForm({ 
  isOpen, 
  onClose, 
  editField = null, 
  geometry = null, 
  geometryType = 'polygon' 
}: UserFieldFormProps) {
  const { createUserField, updateUserField, loading, error, clearError } = useUserFieldsStore();
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (editField) {
      setName(editField.name);
    } else {
      setName('');
    }
    setFormError('');
    clearError();
  }, [editField, isOpen, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!name.trim()) {
      setFormError('Le nom du champ est requis');
      return;
    }

    if (!editField && !geometry) {
      setFormError('La géométrie est requise');
      return;
    }

    try {
      if (editField) {
        await updateUserField(editField.id, { 
          name: name.trim(),
          ...(geometry && { geometry, geometry_type: geometryType })
        });
      } else {
        await createUserField({
          name: name.trim(),
          geometry,
          geometry_type: geometryType
        });
      }
      onClose();
      setName('');
    } catch (err) {
      console.error('Error saving user field:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editField ? 'Modifier le champ' : 'Nouveau champ'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {(error || formError) && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {formError || error}
              </span>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du champ *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Entrez le nom du champ"
              disabled={loading}
            />
          </div>

          {!editField && geometryType && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de géométrie
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300">
                {geometryType === 'point' && 'Point'}
                {geometryType === 'polygon' && 'Polygone'}
                {geometryType === 'circle' && 'Cercle'}
                {geometryType === 'rectangle' && 'Rectangle'}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || (!editField && !geometry)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Enregistrement...' : (editField ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}