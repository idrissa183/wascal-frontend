import { useRef, useCallback, createElement } from "react";
import type { Feature } from "ol";
import { Point, Polygon, Circle as CircleGeom, Geometry } from "ol/geom";
import { Style, Fill, Stroke, Circle as CircleStyle, Icon } from "ol/style";
import Overlay from "ol/Overlay";
import { toLonLat } from "ol/proj";
import { unByKey } from "ol/Observable";
import { renderToStaticMarkup } from "react-dom/server";
import { Save, Edit2, MapPin } from "lucide-react";
import { getArea, getLength } from "ol/sphere";
import type {
  FeatureType,
  DrawnFeature,
  UseMapFeaturesOptions,
} from "../types/mapFeatures";

export const useMapFeatures = (
  mapInstance: any,
  vectorSource: any,
  options: UseMapFeaturesOptions = {}
) => {
  const drawnFeaturesRef = useRef<Map<string, DrawnFeature>>(new Map());
  const selectedFeatureRef = useRef<string | null>(null);
  const locationIconUrl = `data:image/svg+xml,${encodeURIComponent(
    renderToStaticMarkup(createElement(MapPin))
  )}`;

  // Styles pour les différents états
  const createFeatureStyle = useCallback(
    (
      geometryType: FeatureType,
      isSelected: boolean = false,
      isEditing: boolean = false
    ) => {
      const baseColor = isSelected
        ? "#ff6b35"
        : isEditing
        ? "#9333ea"
        : "#4285f4";
      const fillColor = isSelected
        ? "rgba(255, 107, 53, 0.15)"
        : isEditing
        ? "rgba(147, 51, 234, 0.15)"
        : "rgba(66, 133, 244, 0.1)";

      if (geometryType === "point") {
        return new Style({
          image: new Icon({
            src: locationIconUrl,
            anchor: [0.5, 1],
            scale: isSelected ? 2.4 : isEditing ? 2.2 : 2,
          }),
        });
      }

      return new Style({
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({
          color: baseColor,
          width: isSelected ? 3 : isEditing ? 2.5 : 2,
          lineDash: isSelected ? [8, 4] : isEditing ? [6, 3] : undefined,
        }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: baseColor }),
          stroke: new Stroke({ color: "#ffffff", width: 2 }),
        }),
      });
    },
    []
  );

  // Créer un overlay avec animation
  const createOverlay = useCallback(
    (
      content: string,
      className: string,
      title: string,
      onClick: () => void
    ) => {
      const button = document.createElement("button");
      button.className = `${className} transform transition-all duration-200 hover:scale-110 active:scale-95`;
      button.title = title;
      button.innerHTML = content;

      button.addEventListener("click", (e) => {
        e.stopPropagation();
        onClick();
      });

      return new Overlay({
        element: button,
        positioning: "center-center",
        offset: [0, 0],
        stopEvent: true,
        insertFirst: false,
      });
    },
    []
  );

  // Calculer les métadonnées de la géométrie
  const calculateMetadata = useCallback((geometry: Geometry) => {
    const metadata: any = {};

    if (geometry instanceof Point) {
      const coords = toLonLat(geometry.getCoordinates());
      metadata.center = [coords[1], coords[0]]; // [lat, lng]
    } else if (geometry instanceof Polygon) {
      metadata.area = getArea(geometry);
      metadata.perimeter = getLength(geometry);
      const center = toLonLat(geometry.getInteriorPoint().getCoordinates());
      metadata.center = [center[1], center[0]];
    } else if (geometry instanceof CircleGeom) {
      const center = toLonLat(geometry.getCenter());
      const radius = geometry.getRadius();
      metadata.center = [center[1], center[0]];
      metadata.radius = radius;
      metadata.area = Math.PI * Math.pow(radius, 2);
      metadata.perimeter = 2 * Math.PI * radius;
    }

    return metadata;
  }, []);

  // Formater les métadonnées pour l'affichage
  const formatMetadataInfo = useCallback(
    (metadata: DrawnFeature["metadata"]) => {
      if (!metadata) return "";

      const parts: string[] = [];

      if (metadata.area !== undefined) {
        const area = metadata.area;
        const areaText =
          area >= 1000000
            ? `${(area / 1000000).toFixed(2)} km²`
            : area >= 10000
            ? `${(area / 10000).toFixed(2)} ha`
            : `${area.toFixed(0)} m²`;
        parts.push(`Area: ${areaText}`);
      }

      if (metadata.perimeter !== undefined) {
        const p = metadata.perimeter;
        const pText =
          p >= 1000 ? `${(p / 1000).toFixed(2)} km` : `${p.toFixed(0)} m`;
        parts.push(`Perimeter: ${pText}`);
      }

      if (metadata.radius !== undefined) {
        const r = metadata.radius;
        const rText =
          r >= 1000 ? `${(r / 1000).toFixed(2)} km` : `${r.toFixed(0)} m`;
        parts.push(`Radius: ${rText}`);
      }

      if (metadata.center) {
        const [lat, lng] = metadata.center;
        parts.push(`Center: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }

      return parts.join("<br/>");
    },
    []
  );

  // Calculer la position optimale pour les overlays
  const calculateOverlayPosition = useCallback(
    (geometry: Geometry, offset: [number, number] = [0, 0]) => {
      let position: number[];

      if (geometry instanceof Point) {
        position = geometry.getCoordinates();
      } else if (geometry instanceof Polygon) {
        // Pour un polygone, utiliser le centroïde
        position = geometry.getInteriorPoint().getCoordinates();
      } else if (geometry instanceof CircleGeom) {
        position = geometry.getCenter();
      } else {
        // Fallback: utiliser l'extent center
        const extent = geometry.getExtent();
        position = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];
      }

      return [position[0] + offset[0], position[1] + offset[1]];
    },
    []
  );

  // Convertir la géométrie en GeoJSON
  const convertToGeoJSON = useCallback(
    (geometry: Geometry, type: FeatureType) => {
      if (geometry instanceof Point) {
        const coord = toLonLat(geometry.getCoordinates());
        return {
          type: "Point",
          coordinates: coord,
        };
      } else if (geometry instanceof Polygon) {
        const rings = geometry
          .getCoordinates()
          .map((ring) => ring.map((coord) => toLonLat(coord)));
        return {
          type: "Polygon",
          coordinates: rings,
        };
      } else if (geometry instanceof CircleGeom) {
        const center = toLonLat(geometry.getCenter());
        const radius = geometry.getRadius();
        if (type === "circle") {
          return {
            type: "Circle",
            coordinates: center,
            radius: radius,
          };
        } else {
          // Pour les rectangles créés comme des cercles
          const extent = geometry.getExtent();
          const coords = [
            [
              toLonLat([extent[0], extent[1]]),
              toLonLat([extent[2], extent[1]]),
              toLonLat([extent[2], extent[3]]),
              toLonLat([extent[0], extent[3]]),
              toLonLat([extent[0], extent[1]]),
            ],
          ];
          return {
            type: "Polygon",
            coordinates: coords,
          };
        }
      }
      return null;
    },
    []
  );

  // Créer les overlays pour une figure
  const createFeatureOverlays = useCallback(
    (feature: Feature, type: FeatureType) => {
      // Overlay de sauvegarde
      const saveOverlay = createOverlay(
        renderToStaticMarkup(
          createElement(Save, { className: "w-4 h-4 text-white" })
        ),
        "p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg border-2 border-white z-50",
        "Sauvegarder cette figure",
        () => {
          const geometry = feature.getGeometry();
          if (geometry && options.onSave) {
            const geoJson = convertToGeoJSON(geometry, type);
            options.onSave(feature, type, geoJson);
          }
        }
      );

      // Overlay d'édition (optionnel)
      let editOverlay;
      if (options.showEditControls) {
        editOverlay = createOverlay(
          renderToStaticMarkup(
            createElement(Edit2, { className: "w-4 h-4 text-white" })
          ),
          "p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg border-2 border-white z-50",
          "Éditer cette figure",
          () => {
            if (options.onEdit) {
              options.onEdit(feature, type);
            }
          }
        );
      }

      // Overlay d'information (optionnel)
      let infoOverlay;
      if (options.showInfoDisplay) {
        const geometry = feature.getGeometry();
        if (geometry) {
          const metadata = calculateMetadata(geometry);
          const infoText = formatMetadataInfo(metadata);

          if (infoText) {
            const infoElement = document.createElement("div");
            infoElement.className =
              "px-3 py-1.5 bg-black bg-opacity-75 text-white text-xs rounded-lg shadow-lg border border-gray-600";
            infoElement.innerHTML = infoText;

            infoOverlay = new Overlay({
              element: infoElement,
              positioning: "bottom-center",
              offset: [0, -10],
              stopEvent: false,
            });
          }
        }
      }

      return {
        save: saveOverlay,
        edit: editOverlay,
        info: infoOverlay,
      };
    },

    [
      createOverlay,
      calculateMetadata,
      formatMetadataInfo,
      options,
      convertToGeoJSON,
    ]
  );

  // Mettre à jour la position des overlays
  const updateOverlayPositions = useCallback(
    (featureId: string) => {
      const drawnFeature = drawnFeaturesRef.current.get(featureId);
      if (!drawnFeature || !drawnFeature.isSelected) return;

      const geometry = drawnFeature.feature.getGeometry();
      if (!geometry) return;

      // Positions relatives pour chaque overlay
      const positions = {
        save: calculateOverlayPosition(geometry, [0, -40]),
        edit: calculateOverlayPosition(geometry, [0, -60]),
        info: calculateOverlayPosition(geometry, [0, 40]),
      };

      // Mettre à jour les positions
      drawnFeature.overlays.save.setPosition(positions.save);

      if (drawnFeature.overlays.edit) {
        drawnFeature.overlays.edit.setPosition(positions.edit);
      }

      if (drawnFeature.overlays.info) {
        drawnFeature.overlays.info.setPosition(positions.info);
      }
    },
    [calculateOverlayPosition]
  );

  // Masquer les overlays d'une figure
  const hideOverlays = useCallback((featureId: string) => {
    const drawnFeature = drawnFeaturesRef.current.get(featureId);
    if (!drawnFeature) return;

    drawnFeature.overlays.save.setPosition(undefined);

    if (drawnFeature.overlays.edit) {
      drawnFeature.overlays.edit.setPosition(undefined);
    }

    if (drawnFeature.overlays.info) {
      drawnFeature.overlays.info.setPosition(undefined);
    }
  }, []);

  // Sélectionner une figure
  const selectFeature = useCallback(
    (featureId: string) => {
      // Désélectionner l'ancienne figure
      if (selectedFeatureRef.current) {
        const oldFeature = drawnFeaturesRef.current.get(
          selectedFeatureRef.current
        );
        if (oldFeature) {
          oldFeature.isSelected = false;
          oldFeature.feature.setStyle(
            createFeatureStyle(oldFeature.type, false, oldFeature.isEditing)
          );
          // Masquer les overlays
          hideOverlays(selectedFeatureRef.current);
        }
      }

      // Sélectionner la nouvelle figure
      selectedFeatureRef.current = featureId;
      const newFeature = drawnFeaturesRef.current.get(featureId);
      if (newFeature) {
        newFeature.isSelected = true;
        newFeature.feature.setStyle(
          createFeatureStyle(newFeature.type, true, newFeature.isEditing)
        );
        updateOverlayPositions(featureId);

        if (options.onSelect) {
          options.onSelect(newFeature.feature, newFeature.type);
        }
      }
    },
    [createFeatureStyle, updateOverlayPositions, hideOverlays, options]
  );

  // Désélectionner toutes les figures
  const deselectAllFeatures = useCallback(() => {
    drawnFeaturesRef.current.forEach((drawnFeature, featureId) => {
      drawnFeature.isSelected = false;
      drawnFeature.feature.setStyle(
        createFeatureStyle(drawnFeature.type, false, drawnFeature.isEditing)
      );
      hideOverlays(featureId);
    });
    selectedFeatureRef.current = null;

    if (options.onDeselect) {
      options.onDeselect();
    }
  }, [createFeatureStyle, hideOverlays, options]);

  // Ajouter une nouvelle figure
  const addFeature = useCallback(
    (feature: Feature, type: FeatureType) => {
      const featureId = `feature-${Date.now()}-${Math.random()}`;
      feature.setId(featureId);

      // Créer les overlays
      const overlays = createFeatureOverlays(feature, type);

      // Ajouter les overlays à la carte
      if (mapInstance) {
        mapInstance.addOverlay(overlays.save);

        if (overlays.edit) {
          mapInstance.addOverlay(overlays.edit);
        }

        if (overlays.info) {
          mapInstance.addOverlay(overlays.info);
        }
      }

      // Écouter les changements de géométrie
      const geometry = feature.getGeometry();
      let listeners: any[] = [];
      if (geometry) {
        const listener = geometry.on("change", () => {
          updateOverlayPositions(featureId);
          const df = drawnFeaturesRef.current.get(featureId);
          if (df) {
            const geom = df.feature.getGeometry();
            if (geom) {
              df.metadata = calculateMetadata(geom);
              if (df.overlays.info) {
                const el =
                  df.overlays.info.getElement() as HTMLDivElement | null;
                if (el) {
                  el.innerHTML = formatMetadataInfo(df.metadata);
                }
              }
            }
          }
        });
        listeners.push(listener);
      }

      // Créer l'objet DrawnFeature
      const drawnFeature: DrawnFeature = {
        feature,
        overlays,
        listeners,
        type,
        isSelected: false,
        isEditing: false,
        metadata: geometry ? calculateMetadata(geometry) : undefined,
      };

      // Stocker la figure
      drawnFeaturesRef.current.set(featureId, drawnFeature);

      // Sélectionner automatiquement la figure nouvellement créée
      setTimeout(() => {
        selectFeature(featureId);
      }, 100);

      return featureId;
    },
    [
      createFeatureOverlays,
      mapInstance,
      updateOverlayPositions,
      calculateMetadata,
      selectFeature,
    ]
  );

  // Supprimer une figure
  const removeFeature = useCallback(
    (featureId: string) => {
      const drawnFeature = drawnFeaturesRef.current.get(featureId);

      if (drawnFeature && mapInstance) {
        // Supprimer les overlays
        mapInstance.removeOverlay(drawnFeature.overlays.save);

        if (drawnFeature.overlays.edit) {
          mapInstance.removeOverlay(drawnFeature.overlays.edit);
        }

        if (drawnFeature.overlays.info) {
          mapInstance.removeOverlay(drawnFeature.overlays.info);
        }

        // Supprimer les listeners
        drawnFeature.listeners.forEach((listener) => {
          unByKey(listener);
        });

        // Supprimer de la map et de la source
        drawnFeaturesRef.current.delete(featureId);

        if (vectorSource) {
          vectorSource.removeFeature(drawnFeature.feature);
        }

        if (selectedFeatureRef.current === featureId) {
          selectedFeatureRef.current = null;
        }
      }
    },
    [mapInstance, vectorSource]
  );

  // Effacer toutes les figures
  const clearAllFeatures = useCallback(() => {
    drawnFeaturesRef.current.forEach((_, featureId) => {
      removeFeature(featureId);
    });
    drawnFeaturesRef.current.clear();
    selectedFeatureRef.current = null;
  }, [removeFeature]);

  // Obtenir la figure sélectionnée
  const getSelectedFeature = useCallback(() => {
    if (selectedFeatureRef.current) {
      return drawnFeaturesRef.current.get(selectedFeatureRef.current);
    }
    return null;
  }, []);

  // Obtenir toutes les figures
  const getAllFeatures = useCallback(() => {
    return Array.from(drawnFeaturesRef.current.values());
  }, []);

  return {
    // États
    selectedFeatureId: selectedFeatureRef.current,
    features: drawnFeaturesRef.current,

    // Méthodes
    addFeature,
    removeFeature,
    selectFeature,
    deselectAllFeatures,
    clearAllFeatures,
    updateOverlayPositions,
    getSelectedFeature,
    getAllFeatures,
    createFeatureStyle,
  };
};
