import type { Feature } from "ol";
import Overlay from "ol/Overlay";

/** Feature geometry type supported by drawing tools */
export type FeatureType = "point" | "rectangle" | "polygon" | "circle";

/** Metadata wrapper around an OpenLayers feature with overlays and listeners. */
export interface DrawnFeature {
  feature: Feature;
  overlays: {
    save: Overlay;
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

/**
 * Options available for the `useMapFeatures` hook.
 */
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
