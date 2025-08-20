// src/hooks/useMapFeatures.ts
import { useRef, useCallback } from 'react';
import { Feature } from 'ol';
import { Point, Polygon, Circle as CircleGeom, Geometry } from 'ol/geom';
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import Overlay from 'ol/Overlay';
import { toLonLat } from 'ol/proj';
import { unByKey } from 'ol/Observable';
import { renderToStaticMarkup } from 'react-dom/server';
import { Save, X, Edit2, Move } from 'lucide-react';

export type FeatureType = "point" | "rectangle" | "polygon" | "circle";

export interface DrawnFeature {
  feature: Feature;
  overlays: {
    save: Overlay;
    delete: Overlay;
    edit?: Overlay;
    info?: Overlay;
  };
  listeners: any[];
  type: FeatureType;
  isSelected: boolean;
  isEditing: boolean;
  metadata?: {
    area?: number;
    perimeter?: number;
    center?: [number, number];
    radius?: number;
  };
}

export interface UseMapFeaturesOptions {
  onSave?: (feature: Feature, type: FeatureType, geometry: any) => void;
  onDelete?: (feature: Feature, type: FeatureType) => void;
  onSelect?: (feature: Feature, type: FeatureType) => void;
  onDeselect?: () => void;
  onEdit?: (feature: Feature, type: FeatureType) => void;
  showEditControls?: boolean;
  showInfoDisplay?: boolean;
  enableSnapping?: boolean;
}

export const useMapFeatures = (
  mapInstance: any,
  vectorSource: any,
  options: UseMapFeaturesOptions = {}
) => {
  const drawnFeaturesRef = useRef<Map<string, DrawnFeature>>(new Map());
  const selectedFeatureRef = useRef<string | null>(null);

  // Styles pour les différents états
  const createFeatureStyle = useCallback((
    geometryType: FeatureType,
    isSelected: boolean = false,
    isEditing: boolean = false