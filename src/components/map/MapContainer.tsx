import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  MapIcon,
  CursorArrowRippleIcon,
  RectangleStackIcon,
  StopIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
  AdjustmentsHorizontalIcon,
  PhotoIcon,
  CogIcon,
  ScissorsIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import "./MapContainer.css";

// OpenLayers imports
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { Feature } from "ol";
import { Point, Polygon } from "ol/geom";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import { Draw, Modify, Select } from "ol/interaction";
import { createBox } from "ol/interaction/Draw";
import { fromLonLat, toLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import MousePosition from "ol/control/MousePosition";
import ScaleLine from "ol/control/ScaleLine";
import { createStringXY } from "ol/coordinate";

interface MapContainerProps {
  onSelectionChange?: (selection: any) => void;
  onLayerChange?: (layers: string[]) => void;
  className?: string;
}

type SelectionTool = "none" | "point" | "rectangle" | "polygon" | "circle";

interface LayerControl {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  type: "raster" | "vector";
  layer?: TileLayer<any> | VectorLayer<any>;
}

export default function MapContainer({
  onSelectionChange,
  onLayerChange,
  className = "",
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource>(new VectorSource());
  const drawRef = useRef<Draw | null>(null);
  const t = useTranslations();

  // États pour les contrôles de la carte
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<SelectionTool>("none");
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // États pour les coordonnées dynamiques
  const [mouseCoordinates, setMouseCoordinates] = useState<[number, number]>([
    12.3714, -1.5197,
  ]);
  const [zoom, setZoom] = useState(7);

  // États pour les couches
  const [layers, setLayers] = useState<LayerControl[]>([
    {
      id: "osm",
      name: "OpenStreetMap",
      visible: true,
      opacity: 100,
      type: "raster",
    },
    {
      id: "satellite",
      name: "Satellite",
      visible: false,
      opacity: 100,
      type: "raster",
    },
    { id: "ndvi", name: "NDVI", visible: false, opacity: 70, type: "raster" },
    {
      id: "temperature",
      name: "Température",
      visible: false,
      opacity: 70,
      type: "raster",
    },
    {
      id: "precipitation",
      name: "Précipitations",
      visible: false,
      opacity: 70,
      type: "raster",
    },
    {
      id: "boundaries",
      name: "Frontières",
      visible: true,
      opacity: 80,
      type: "vector",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      initializeMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) return;

    console.log("Initializing OpenLayers map...");

    // Créer les couches de base
    const osmLayer = new TileLayer({
      source: new OSM(),
      visible: true,
    });

    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        attributions: "© Google",
      }),
      visible: false,
    });

    // Couche vectorielle pour les dessins
    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.2)",
        }),
        stroke: new Stroke({
          color: "#ffcc33",
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: "#ffcc33",
          }),
        }),
      }),
    });

    // Contrôle de position de souris dynamique
    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: "EPSG:4326",
      undefinedHTML: "&nbsp;",
      className: "custom-mouse-position",
    });

    // Contrôle d'échelle personnalisé
    const scaleLineControl = new ScaleLine({
      units: "metric",
      className: "custom-scale-line",
      minWidth: 80,
    });

    // Créer la carte sans les contrôles par défaut qui sont redondants
    const map = new Map({
      target: mapRef.current,
      layers: [osmLayer, satelliteLayer, vectorLayer],
      view: new View({
        center: fromLonLat([-1.5197, 12.3714]), // Ouagadougou
        zoom: zoom,
      }),
      controls: defaultControls({
        attribution: false,
        zoom: false, // On enlève les contrôles de zoom car on a nos propres boutons
        rotate: false,
      }).extend([mousePositionControl, scaleLineControl]),
    });

    // Écouter les mouvements de souris pour mettre à jour les coordonnées
    map.on("pointermove", (event) => {
      const coordinates = toLonLat(event.coordinate);
      setMouseCoordinates([coordinates[1], coordinates[0]]); // lat, lon
    });

    // Écouter les changements de vue pour le zoom
    map.getView().on("change:resolution", () => {
      const currentZoom = map.getView().getZoom();
      if (currentZoom !== undefined) {
        setZoom(Math.round(currentZoom));
      }
    });

    // Mettre à jour les références des couches
    setLayers((prev) =>
      prev.map((layer) => {
        switch (layer.id) {
          case "osm":
            return { ...layer, layer: osmLayer };
          case "satellite":
            return { ...layer, layer: satelliteLayer };
          case "boundaries":
            return { ...layer, layer: vectorLayer };
          default:
            return layer;
        }
      })
    );

    mapInstanceRef.current = map;
    setMapLoaded(true);

    // Ajouter quelques points d'exemple
    addSampleData();
  };

  const addSampleData = () => {
    if (!vectorSourceRef.current) return;

    // Ajouter quelques stations météo d'exemple
    const stations = [
      { name: "Ouagadougou", coords: [-1.5197, 12.3714] },
      { name: "Bobo-Dioulasso", coords: [-4.2945, 11.1777] },
      { name: "Koudougou", coords: [-2.3667, 12.2533] },
      { name: "Banfora", coords: [-4.75, 10.6333] },
    ];

    stations.forEach((station) => {
      const point = new Point(fromLonLat(station.coords));
      const feature = new Feature({
        geometry: point,
        name: station.name,
        type: "station",
      });

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: "#3b82f6" }),
            stroke: new Stroke({ color: "#1e40af", width: 2 }),
          }),
        })
      );

      vectorSourceRef.current?.addFeature(feature);
    });
  };

  const handleToolChange = (tool: SelectionTool) => {
    if (!mapInstanceRef.current) return;

    // Supprimer l'interaction précédente
    if (drawRef.current) {
      mapInstanceRef.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    if (tool === activeTool || tool === "none") {
      setActiveTool("none");
      return;
    }

    let geometryType: string | undefined;
    const drawOptions: any = {
      source: vectorSourceRef.current,
    };
    switch (tool) {
      case "point":
        geometryType = "Point";
        break;
      case "rectangle":
        geometryType = "Circle";
        drawOptions.geometryFunction = createBox();
        break;
      case "polygon":
        geometryType = "Polygon";
        break;
      case "circle":
        geometryType = "Circle";
        break;
      default:
        return;
    }

    // Créer une nouvelle interaction de dessin
    if (geometryType) {
      const draw = new Draw({
        ...drawOptions,
        type: geometryType as any,
      });

      draw.on("drawend", (event) => {
        const feature = event.feature;
        const geometry = feature.getGeometry();

        if (onSelectionChange) {
          onSelectionChange({
            type: tool,
            geometry: geometry,
            coordinates: geometry?.getCoordinates(),
          });
        }

        console.log(`${tool} drawn:`, geometry?.getCoordinates());
      });

      mapInstanceRef.current.addInteraction(draw);
      drawRef.current = draw;
    }

    setActiveTool(tool);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      const currentZoom = view.getZoom() || 7;
      view.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      const currentZoom = view.getZoom() || 7;
      view.setZoom(currentZoom - 1);
    }
  };

  const handleLayerToggle = (layerId: string) => {
    const updatedLayers = layers.map((layer) => {
      if (layer.id === layerId) {
        const newVisible = !layer.visible;

        // Mettre à jour la visibilité de la couche OpenLayers
        if (layer.layer) {
          layer.layer.setVisible(newVisible);
        }

        return { ...layer, visible: newVisible };
      }
      return layer;
    });

    setLayers(updatedLayers);
    onLayerChange?.(updatedLayers.filter((l) => l.visible).map((l) => l.id));
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    const updatedLayers = layers.map((layer) => {
      if (layer.id === layerId) {
        // Mettre à jour l'opacité de la couche OpenLayers
        if (layer.layer) {
          layer.layer.setOpacity(opacity / 100);
        }

        return { ...layer, opacity };
      }
      return layer;
    });
    setLayers(updatedLayers);
  };

  const handleCut = () => {
    vectorSourceRef.current?.clear();
  };

  const handleUndo = () => {
    const features = vectorSourceRef.current?.getFeatures();
    if (features && features.length > 0) {
      vectorSourceRef.current?.removeFeature(features[features.length - 1]);
    }
  };

  const exportMap = () => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.once("rendercomplete", () => {
      const mapCanvas = document.createElement("canvas");
      const size = mapInstanceRef.current!.getSize();
      if (size) {
        mapCanvas.width = size[0];
        mapCanvas.height = size[1];
        const mapContext = mapCanvas.getContext("2d");
        if (mapContext) {
          Array.prototype.forEach.call(
            document.querySelectorAll(".ol-layer canvas"),
            (canvas: HTMLCanvasElement) => {
              if (canvas.width > 0) {
                const opacity = canvas.parentElement?.style.opacity;
                mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
                const transform = canvas.style.transform;
                const matrix = transform
                  .match(/^matrix\(([^(]*)\)$/)?.[1]
                  .split(",")
                  .map(Number);
                if (matrix) {
                  mapContext.setTransform(...matrix);
                }
                mapContext.drawImage(canvas, 0, 0);
              }
            }
          );
          mapContext.globalAlpha = 1;

          // Télécharger l'image
          const link = document.createElement("a");
          link.download = "map.png";
          link.href = mapCanvas.toDataURL();
          link.click();
        }
      }
    });
    mapInstanceRef.current.renderSync();
  };

  const resetView = () => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      view.setCenter(fromLonLat([-1.5197, 12.3714]));
      view.setZoom(7);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Utiliser Nominatim pour la géolocalisation
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const results = await response.json();

      if (results.length > 0) {
        const result = results[0];
        const coords = [parseFloat(result.lon), parseFloat(result.lat)];

        if (mapInstanceRef.current) {
          const view = mapInstanceRef.current.getView();
          view.setCenter(fromLonLat(coords));
          view.setZoom(12);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div
      className={`relative w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden map-container ${className}`}
      style={{ minHeight: "400px" }}
    >
      {/* Barre de recherche */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={
              t.map_page?.search_placeholder || "Rechercher une localisation..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-64 sm:w-80 pl-10 pr-4 py-2 sm:py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg shadow-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
      </div>

      {/* Contrôles essentiels en haut à droite */}
      <div className="responsive-map-controls">
        <button
          onClick={handleFullscreen}
          className="p-2 sm:p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Plein écran"
        >
          {isFullscreen ? (
            <ArrowsPointingInIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <ArrowsPointingOutIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
        <button
          onClick={resetView}
          className="p-2 sm:p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Vue par défaut"
        >
          <MapIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Barre d'outils de sélection */}
      {showToolbar && (
        <div className="absolute top-16 sm:top-20 left-2 sm:left-4 z-20">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-2">
            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
              <button
                onClick={handleZoomIn}
                className="p-1.5 sm:p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                title="Zoom avant"
              >
                <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 sm:p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                title="Zoom arrière"
              >
                <MinusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <div className="border-t sm:border-t-0 sm:border-l border-gray-300 dark:border-gray-600 my-1 sm:my-0 sm:mx-1"></div>
              <button
                onClick={() => handleToolChange("point")}
                className={`p-2 rounded-md transition-colors ${
                  activeTool === "point"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
                title="Sélection par point"
              >
                <CursorArrowRippleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => handleToolChange("rectangle")}
                className={`p-2 rounded-md transition-colors ${
                  activeTool === "rectangle"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
                title="Sélection rectangulaire"
              >
                <RectangleStackIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => handleToolChange("polygon")}
                className={`p-2 rounded-md transition-colors ${
                  activeTool === "polygon"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
                title="Sélection polygonale"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleToolChange("circle")}
                className={`p-2 rounded-md transition-colors ${
                  activeTool === "circle"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
                title="Sélection circulaire"
              >
                <StopIcon className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" />
              </button>
              <button
                onClick={handleCut}
                className="p-1.5 sm:p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                title="Effacer les dessins"
              >
                <ScissorsIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={handleUndo}
                className="p-1.5 sm:p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                title="Annuler le dernier dessin"
              >
                <ArrowUturnLeftIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteneur de la carte */}
      <div ref={mapRef} className="w-full h-full absolute inset-0">
        {!mapLoaded && (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">
                Chargement de la carte...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Panneau de contrôle des couches */}
      {showLayerPanel && (
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-30 w-72 sm:w-80">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                Couches de données
              </h4>
              <button
                onClick={() => setShowLayerPanel(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 sm:p-4 max-h-60 sm:max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {layers.map((layer) => (
                  <div key={layer.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={layer.visible}
                          onChange={() => handleLayerToggle(layer.id)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {layer.name}
                        </span>
                      </label>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        {layer.visible ? (
                          <EyeIcon className="w-4 h-4" />
                        ) : (
                          <EyeSlashIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {layer.visible && (
                      <div className="ml-4 sm:ml-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-16">
                            Opacité:
                          </span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={layer.opacity}
                            onChange={(e) =>
                              handleOpacityChange(
                                layer.id,
                                parseInt(e.target.value)
                              )
                            }
                            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                            {layer.opacity}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton pour réafficher le panneau de couches */}
      {!showLayerPanel && (
        <button
          onClick={() => setShowLayerPanel(true)}
          className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-30 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
        </button>
      )}

      {/* Contrôles supplémentaires */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20 flex space-x-1 sm:space-x-2">
        <button
          onClick={exportMap}
          className="p-2 sm:p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Exporter la carte"
        >
          <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          onClick={() => setShowToolbar(!showToolbar)}
          className="p-2 sm:p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Basculer la barre d'outils"
        >
          <CogIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Coordonnées dynamiques en bas au milieu */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black bg-opacity-75 text-white px-2 sm:px-3 py-1 rounded text-xs">
          Lat: {mouseCoordinates[0].toFixed(4)}° | Lon:{" "}
          {mouseCoordinates[1].toFixed(4)}° | Zoom: {zoom}
        </div>
      </div>
    </div>
  );
}
