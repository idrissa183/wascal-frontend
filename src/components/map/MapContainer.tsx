import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import { useGeographicStore } from "../../stores/useGeographicStore";
import { useUserFieldsStore } from "../../stores/useUserFieldsStore";
import { useMapFeatures } from "../../hooks/useMapFeatures";
import { MAP_DEFAULTS, WASCAL_BOUNDS } from "../../constants";
import { GeographicSelections } from "./GeographicSelections";
import { UserFieldsPanel } from "./UserFieldsPanel";
import { TwoColumnSidebar } from "./TwoColumnSidebar";
import { UserFieldEditor } from "./UserFieldEditor";
import type { FeatureType } from "../../types/mapFeatures";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  MapIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  EyeSlashIcon,
  AdjustmentsHorizontalIcon,
  PhotoIcon,
  CogIcon,
  ScissorsIcon,
  ArrowUturnLeftIcon,
  MapPinIcon,
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
import {
  Point,
  Polygon,
  MultiPolygon,
  Circle as CircleGeom,
  Geometry,
} from "ol/geom";
import { Style, Fill, Stroke, Circle as CircleStyle, Icon } from "ol/style";
import { Draw, Modify, Select, Translate, Snap } from "ol/interaction";
import { createBox } from "ol/interaction/Draw";
import { fromLonLat, toLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import MousePosition from "ol/control/MousePosition";
import ScaleLine from "ol/control/ScaleLine";
import { createStringXY } from "ol/coordinate";
import { FaRegCircle } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { renderToStaticMarkup } from "react-dom/server";
import { LuRectangleHorizontal } from "react-icons/lu";
import { PiPolygonBold } from "react-icons/pi";
import { Save, MapPin } from "lucide-react";
import Overlay from "ol/Overlay";
import { getArea } from "ol/sphere";
import { singleClick } from "ol/events/condition";
import { unByKey } from "ol/Observable"; // <-- NOUVEL IMPORT
import type { EventsKey } from "ol/events"; // <-- NOUVEL IMPORT

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
  const modifyRef = useRef<Modify | null>(null);
  const selectRef = useRef<Select | null>(null);
  const translateRef = useRef<Translate | null>(null);
  const snapRef = useRef<Snap | null>(null);
  const t = useTranslations();
  const { selectedEntities, isLoadingGeometry } = useGeographicStore();
  const { userFields } = useUserFieldsStore();

  const geographicSourceRef = useRef<VectorSource>(new VectorSource());
  const userFieldsSourceRef = useRef<VectorSource>(new VectorSource());

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<SelectionTool>("none");
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [showUserFieldsPanel, setShowUserFieldsPanel] = useState(false);
  const [pendingGeometry, setPendingGeometry] = useState<any>(null);
  const [pendingGeometryType, setPendingGeometryType] = useState<
    "point" | "polygon" | "circle" | "rectangle" | null
  >(null);
  const [showUserFieldEditor, setShowUserFieldEditor] = useState(false);
  const [editingUserField, setEditingUserField] = useState<any>(null);
  const [currentDrawingArea, setCurrentDrawingArea] = useState<number>(0);

  const [visibleUserFields, setVisibleUserFields] = useState<Set<number>>(
    new Set()
  );

  const [mouseCoordinates, setMouseCoordinates] = useState<[number, number]>([
    MAP_DEFAULTS.CENTER[0],
    MAP_DEFAULTS.CENTER[1],
  ]);
  const [zoom, setZoom] = useState<number>(MAP_DEFAULTS.ZOOM);
  const locationIconUrl = `data:image/svg+xml,${encodeURIComponent(
    renderToStaticMarkup(<MapPin />)
  )}`;
  const pointStyle = new Style({
    image: new Icon({
      src: locationIconUrl,
      anchor: [0.5, 1],
      scale: 2,
    }),
  });

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

  const mapFeatures = useMapFeatures(
    mapInstanceRef.current,
    vectorSourceRef.current,
    {
      onSave: (feature, type, geoJson) => {
        const geometryType = type as
          | "point"
          | "polygon"
          | "circle"
          | "rectangle";
        setPendingGeometry(geoJson);
        setPendingGeometryType(geometryType);
        setShowUserFieldEditor(true);
        setEditingUserField(null);
        setShowUserFieldsPanel(true);
      },
      onDelete: (feature, type) => {
        const featureId = feature.getId() as string;
        mapFeatures.removeFeature(featureId);
      },
      onSelect: (feature, type) => {
        console.log(`Figure ${type} sélectionnée:`, feature);
      },
      onDeselect: () => {
        console.log("Aucune figure sélectionnée");
      },
      showEditControls: false,
      showInfoDisplay: true,
      enableSnapping: true,
    }
  );

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

  useEffect(() => {
    if (!geographicSourceRef.current) return;
    geographicSourceRef.current.clear();
    selectedEntities.forEach((entity) => {
      if (entity.geometry && !entity.isLoading && !entity.error) {
        try {
          const geometryData = entity.geometry;
          let olGeometry: Geometry;

          if (geometryData.type === "Polygon") {
            const rings = geometryData.coordinates.map(
              (ring: [number, number][]) =>
                ring.map((coord: [number, number]) =>
                  fromLonLat([coord[0], coord[1]])
                )
            );
            olGeometry = new Polygon(rings);
          } else if (geometryData.type === "MultiPolygon") {
            const polygons: any[][][] = [];
            geometryData.coordinates.forEach((polygonCoords: any) => {
              const rings = polygonCoords.map((ring: [number, number][]) =>
                ring.map((coord: [number, number]) =>
                  fromLonLat([coord[0], coord[1]])
                )
              );
              polygons.push(rings);
            });
            olGeometry = new MultiPolygon(polygons);
          } else if (geometryData.type === "Point") {
            const coord = fromLonLat([
              geometryData.coordinates[0],
              geometryData.coordinates[1],
            ]);
            olGeometry = new Point(coord);
          } else {
            console.warn(`Unsupported geometry type: ${geometryData.type}`);
            olGeometry = new Point(fromLonLat([0, 0]));
          }

          const feature = new Feature({
            geometry: olGeometry,
            name: entity.name,
            type: entity.type,
            entityId: entity.id,
          });

          const getEntityStyle = (type: string) => {
            const colors = {
              country: { fill: "rgba(59, 130, 246, 0.2)", stroke: "#3b82f6" },
              region: { fill: "rgba(16, 185, 129, 0.2)", stroke: "#10b981" },
              province: { fill: "rgba(245, 158, 11, 0.2)", stroke: "#f59e0b" },
            };
            const color = colors[type as keyof typeof colors] || colors.region;
            return new Style({
              fill: new Fill({ color: color.fill }),
              stroke: new Stroke({ color: color.stroke, width: 2 }),
            });
          };

          feature.setStyle(getEntityStyle(entity.type));
          geographicSourceRef.current?.addFeature(feature);
        } catch (error) {
          console.error(
            `Error adding feature for ${entity.type} ${entity.id}:`,
            error
          );
        }
      }
    });

    if (
      geographicSourceRef.current?.getFeatures().length > 0 &&
      mapInstanceRef.current
    ) {
      const extent = geographicSourceRef.current.getExtent();
      mapInstanceRef.current.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        maxZoom: 10,
        duration: 1000,
      });
    }
  }, [selectedEntities]);

  useEffect(() => {
    if (!userFieldsSourceRef.current) return;
    userFieldsSourceRef.current.clear();
    userFields.forEach((field) => {
      if (visibleUserFields.has(field.id) && field.geometry) {
        try {
          const geoJson = field.geometry;
          let olGeometry: Geometry;

          if (geoJson.type === "Point") {
            const coord = fromLonLat([
              geoJson.coordinates[0],
              geoJson.coordinates[1],
            ]);
            olGeometry = new Point(coord);
          } else if (geoJson.type === "Polygon") {
            const rings = geoJson.coordinates.map((ring: [number, number][]) =>
              ring.map((coord: [number, number]) =>
                fromLonLat([coord[0], coord[1]])
              )
            );
            olGeometry = new Polygon(rings);
          } else if (geoJson.type === "Circle") {
            const center = fromLonLat([
              geoJson.coordinates[0],
              geoJson.coordinates[1],
            ]);
            const radius = geoJson.radius || 1000;
            olGeometry = new CircleGeom(center, radius);
          } else {
            console.warn(
              `Unsupported user field geometry type: ${geoJson.type}`
            );
            return;
          }

          const feature = new Feature({
            geometry: olGeometry,
            name: field.name,
            type: "user_field",
            fieldId: field.id,
            geometryType: field.geometry_type,
          });

          const getFieldStyle = (geometryType: string) => {
            if (geometryType.toLowerCase() === "point") {
              return pointStyle;
            }
            return new Style({
              fill: new Fill({ color: "rgba(59, 130, 246, 0.3)" }),
              stroke: new Stroke({ color: "#3b82f6", width: 2 }),
            });
          };

          feature.setStyle(getFieldStyle(field.geometry_type));
          userFieldsSourceRef.current?.addFeature(feature);
        } catch (error) {
          console.error(`Error adding user field ${field.id} to map:`, error);
        }
      }
    });
  }, [userFields, visibleUserFields]);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const osmLayer = new TileLayer({ source: new OSM(), visible: true });
    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        attributions: "© Google",
      }),
      visible: false,
    });

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      style: (feature) => {
        const featureId = feature.getId() as string;
        const drawnFeature = mapFeatures.features.get(featureId);
        if (drawnFeature) {
          return mapFeatures.createFeatureStyle(
            drawnFeature.type,
            drawnFeature.isSelected,
            drawnFeature.isEditing
          );
        }
        return mapFeatures.createFeatureStyle("polygon", false, false);
      },
    });

    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: "EPSG:4326",
      placeholder: "&nbsp;",
      className: "custom-mouse-position",
    });

    const scaleLineControl = new ScaleLine({
      units: "metric",
      className: "custom-scale-line",
      minWidth: 80,
    });

    const geographicLayer = new VectorLayer({
      source: geographicSourceRef.current,
      style: new Style({
        fill: new Fill({ color: "rgba(16, 185, 129, 0.2)" }),
        stroke: new Stroke({ color: "#10b981", width: 2 }),
      }),
    });

    const userFieldsLayer = new VectorLayer({
      source: userFieldsSourceRef.current,
      style: new Style({
        fill: new Fill({ color: "rgba(59, 130, 246, 0.3)" }),
        stroke: new Stroke({ color: "#3b82f6", width: 2 }),
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: "#3b82f6" }),
          stroke: new Stroke({ color: "white", width: 2 }),
        }),
      }),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        osmLayer,
        satelliteLayer,
        vectorLayer,
        geographicLayer,
        userFieldsLayer,
      ],
      view: new View({
        center: fromLonLat([MAP_DEFAULTS.CENTER[1], MAP_DEFAULTS.CENTER[0]]),
        zoom: MAP_DEFAULTS.ZOOM,
        minZoom: MAP_DEFAULTS.MIN_ZOOM,
        maxZoom: MAP_DEFAULTS.MAX_ZOOM,
      }),
      controls: defaultControls({
        attribution: false,
        zoom: false,
        rotate: false,
      }).extend([mousePositionControl, scaleLineControl]),
    });

    map.on("pointermove", (event) => {
      const coordinates = toLonLat(event.coordinate);
      setMouseCoordinates([coordinates[1], coordinates[0]]);
    });

    map.getView().on("change:resolution", () => {
      const currentZoom = map.getView().getZoom();
      if (currentZoom !== undefined) {
        setZoom(Math.round(currentZoom));
      }
    });

    const select = new Select({
      condition: singleClick,
      style: null,
    });

    const modify = new Modify({
      source: vectorSourceRef.current,
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: "#ffffff" }),
          stroke: new Stroke({ color: "#4285f4", width: 2 }),
        }),
      }),
      pixelTolerance: 10,
    });

    // --- DÉBUT DES MODIFICATIONS POUR LA MISE À L'ÉCHELLE CONTRÔLÉE DES RECTANGLES ---
    let changeListenerKey: EventsKey | undefined;

    modify.on("modifystart", (event) => {
      const feature = event.features.getArray()[0];
      if (feature && feature.get("isRectangle")) {
        const geometry = feature.getGeometry() as Polygon;
        const clickCoordinate = event.mapBrowserEvent.coordinate;
        const coordinates = geometry.getCoordinates()[0];

        let closestVertexIndex = -1;
        let minDistance = Infinity;

        coordinates.slice(0, 4).forEach((coord, index) => {
          const dx = coord[0] - clickCoordinate[0];
          const dy = coord[1] - clickCoordinate[1];
          const distance = dx * dx + dy * dy;
          if (distance < minDistance) {
            minDistance = distance;
            closestVertexIndex = index;
          }
        });

        const anchorVertexIndex = (closestVertexIndex + 2) % 4;
        const anchorCoordinate = coordinates[anchorVertexIndex];

        const updateRectangle = (evt: any) => {
          const geom = evt.target as Polygon;
          const currentCoords = geom.getCoordinates()[0];
          const movingVertex = currentCoords[closestVertexIndex];

          const minX = Math.min(anchorCoordinate[0], movingVertex[0]);
          const minY = Math.min(anchorCoordinate[1], movingVertex[1]);
          const maxX = Math.max(anchorCoordinate[0], movingVertex[0]);
          const maxY = Math.max(anchorCoordinate[1], movingVertex[1]);

          const newRectangleCoords = [
            [
              [minX, minY],
              [maxX, minY],
              [maxX, maxY],
              [minX, maxY],
              [minX, minY],
            ],
          ];

          if (changeListenerKey) {
            unByKey(changeListenerKey);
          }
          geom.setCoordinates(newRectangleCoords);
          changeListenerKey = geom.on("change", updateRectangle);
        };

        changeListenerKey = geometry.on("change", updateRectangle);
      }
    });

    modify.on("modifyend", (event) => {
      if (changeListenerKey) {
        unByKey(changeListenerKey);
        changeListenerKey = undefined;
      }
      const feature = event.features.getArray()[0];
      const featureId = feature?.getId() as string;
      if (featureId) {
        mapFeatures.updateOverlayPositions(featureId);
      }
    });
    // --- FIN DES MODIFICATIONS ---

    const translate = new Translate({
      features: select.getFeatures(),
    });

    const snap = new Snap({
      source: vectorSourceRef.current,
    });

    select.on("select", (event) => {
      if (event.selected.length > 0) {
        const feature = event.selected[0];
        const featureId = feature.getId() as string;
        if (featureId) {
          mapFeatures.selectFeature(featureId);
        }
      } else {
        mapFeatures.deselectAllFeatures();
      }
    });

    translate.on("translateend", (event) => {
      const feature = event.features.getArray()[0];
      const featureId = feature.getId() as string;
      if (featureId) {
        mapFeatures.updateOverlayPositions(featureId);
      }
    });

    map.on("singleclick", (event) => {
      const feature = map.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature
      );
      if (!feature) {
        mapFeatures.deselectAllFeatures();
      }
    });

    map.addInteraction(select);
    map.addInteraction(modify);
    map.addInteraction(translate);
    map.addInteraction(snap);
    modifyRef.current = modify;
    selectRef.current = select;
    translateRef.current = translate;
    snapRef.current = snap;

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
  };

  const handleToolChange = (tool: SelectionTool) => {
    if (!mapInstanceRef.current) return;

    if (drawRef.current) {
      mapInstanceRef.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    mapFeatures.deselectAllFeatures();

    if (tool === activeTool || tool === "none") {
      setActiveTool("none");
      return;
    }

    let geometryType: string | undefined;
    const drawOptions: any = {
      source: vectorSourceRef.current,
      style: mapFeatures.createFeatureStyle(tool as FeatureType, false, false),
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

    if (geometryType) {
      const draw = new Draw({
        ...drawOptions,
        type: geometryType as any,
      });

      draw.on("drawstart", (event) => {
        const overlayElement = document.createElement("div");
        const overlay = new Overlay({
          element: overlayElement,
          positioning: "bottom-center",
          offset: [0, -7],
        });
        mapInstanceRef.current?.addOverlay(overlay);
        const geometry = event.feature.getGeometry();
        if (!geometry) return;

        const updateArea = () => {
          let area = 0;
          let position: number[] | undefined;
          if (geometry instanceof Polygon) {
            area = getArea(geometry);
            position = geometry.getInteriorPoint().getCoordinates();
          } else if (geometry instanceof CircleGeom) {
            const radius = geometry.getRadius();
            area = Math.PI * radius * radius;
            position = geometry.getCenter();
          }
          overlayElement.innerHTML = `<div class="px-3 py-2 bg-blue-600 text-white rounded-lg shadow-lg border border-blue-700"><div class="flex items-center space-x-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2"/></svg><span class="text-sm font-medium">${
            area >= 1000000
              ? (area / 1000000).toFixed(2) + " km²"
              : area >= 10000
              ? (area / 10000).toFixed(2) + " ha"
              : area.toFixed(0) + " m²"
          }</span></div></div>`;
          setCurrentDrawingArea(area);
          if (position) {
            overlay.setPosition(position);
          }
        };
        geometry.on("change", updateArea);
        draw.once("drawend", () => {
          updateArea();
          geometry.un("change", updateArea);
          if (overlay) {
            mapInstanceRef.current?.removeOverlay(overlay);
          }
        });
      });

      draw.on("drawend", (event) => {
        const feature = event.feature;
        const geometry = feature.getGeometry();
        if (!geometry) return;

        if (activeTool === "rectangle") {
          feature.set("isRectangle", true);
          if (geometry instanceof Polygon) {
            const extent = geometry.getExtent();
            const rectangleCoords = [
              [
                [extent[0], extent[1]],
                [extent[2], extent[1]],
                [extent[2], extent[3]],
                [extent[0], extent[3]],
                [extent[0], extent[1]],
              ],
            ];
            geometry.setCoordinates(rectangleCoords);
          }
        }

        const featureId = mapFeatures.addFeature(feature, tool as FeatureType);

        if (onSelectionChange) {
          let coordinates: unknown = undefined;
          if (geometry instanceof Point || geometry instanceof Polygon) {
            coordinates = geometry.getCoordinates();
          } else if (geometry instanceof CircleGeom) {
            coordinates = {
              center: geometry.getCenter(),
              radius: geometry.getRadius(),
            };
          }
          onSelectionChange({
            type: tool,
            geometry: geometry as Geometry,
            coordinates: coordinates,
          });
        }

        mapInstanceRef.current?.removeInteraction(draw);
        drawRef.current = null;
        setActiveTool("none");
      });

      mapInstanceRef.current.addInteraction(draw);
      drawRef.current = draw;
    }
    setActiveTool(tool);
  };

  const handleUserFieldVisibilityChange = (
    fieldId: number,
    visible: boolean
  ) => {
    const newVisibleFields = new Set(visibleUserFields);
    if (visible) {
      newVisibleFields.add(fieldId);
    } else {
      newVisibleFields.delete(fieldId);
    }
    setVisibleUserFields(newVisibleFields);
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
    mapInstanceRef.current?.getView().animate({
      zoom: mapInstanceRef.current.getView().getZoom()! + 1,
      duration: 250,
    });
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.getView().animate({
      zoom: mapInstanceRef.current.getView().getZoom()! - 1,
      duration: 250,
    });
  };

  const handleLayerToggle = (layerId: string) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id === layerId) {
          const newVisible = !layer.visible;
          layer.layer?.setVisible(newVisible);
          return { ...layer, visible: newVisible };
        }
        return layer;
      })
    );
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    setLayers((prevLayers) =>
      prevLayers.map((layer) => {
        if (layer.id === layerId) {
          layer.layer?.setOpacity(opacity / 100);
          return { ...layer, opacity };
        }
        return layer;
      })
    );
  };

  const handleCut = () => {
    mapFeatures.clearAllFeatures();
  };

  const handleUndo = () => {
    const allFeatures = mapFeatures.getAllFeatures();
    if (allFeatures.length > 0) {
      const lastFeature = allFeatures[allFeatures.length - 1];
      const featureId = lastFeature.feature.getId() as string;
      mapFeatures.removeFeature(featureId);
    }
  };

  const exportMap = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.once("rendercomplete", () => {
      const mapCanvas = document.createElement("canvas");
      const size = mapInstanceRef.current!.getSize()!;
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext("2d")!;
      Array.prototype.forEach.call(
        document.querySelectorAll(".ol-layer canvas"),
        (canvas: HTMLCanvasElement) => {
          if (canvas.width > 0) {
            const opacity = canvas.parentElement!.style.opacity;
            mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
            const transform = canvas.style.transform;
            const matrix = transform
              .match(/^matrix\(([^)]*)\)$/)?.[1]
              .split(", ")
              .map(Number)!;
            mapContext.setTransform(
              matrix[0],
              matrix[1],
              matrix[2],
              matrix[3],
              matrix[4],
              matrix[5]
            );
            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );
      mapContext.globalAlpha = 1;
      const link = document.createElement("a");
      link.download = "map.png";
      link.href = mapCanvas.toDataURL();
      link.click();
    });
    mapInstanceRef.current.renderSync();
  };

  const resetView = () => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      view.setCenter(
        fromLonLat([MAP_DEFAULTS.CENTER[1], MAP_DEFAULTS.CENTER[0]])
      );
      view.setZoom(MAP_DEFAULTS.ZOOM);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const results = await response.json();
      if (results.length > 0) {
        const { lon, lat } = results[0];
        mapInstanceRef.current?.getView().animate({
          center: fromLonLat([parseFloat(lon), parseFloat(lat)]),
          zoom: 12,
          duration: 1000,
        });
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
        <button
          onClick={() => setShowUserFieldsPanel(!showUserFieldsPanel)}
          className={`p-2 sm:p-2.5 rounded-lg shadow-lg border transition-colors ${
            showUserFieldsPanel
              ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
          title="Mes Champs"
        >
          <Save className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

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
                <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4" />
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
                <LuRectangleHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
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
                <PiPolygonBold className="w-3 h-3 sm:w-4 sm:h-4" />
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
                <FaRegCircle className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" />
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
                <span className="sr-only">ChevronDownBtn</span>
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
                          <label
                            htmlFor="input-opacity"
                            className="text-xs text-gray-500 dark:text-gray-400 w-16"
                          >
                            Opacité:
                          </label>
                          <input
                            id="input-opacity"
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

      {!showLayerPanel && (
        <button
          onClick={() => setShowLayerPanel(true)}
          className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-30 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
          <span className="sr-only">ChevronUpBtn</span>
        </button>
      )}

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

      <GeographicSelections />

      {isLoadingGeometry && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 px-4 py-2 flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Loading geographic data...
            </span>
          </div>
        </div>
      )}

      {showUserFieldsPanel && (
        <div className="absolute top-0 right-0 h-full z-30">
          <TwoColumnSidebar
            isRightColumnVisible={showUserFieldEditor}
            onRightColumnToggle={(visible) => {
              setShowUserFieldEditor(visible);
              if (!visible) setEditingUserField(null);
            }}
            rightColumnContent={
              <UserFieldEditor
                pendingGeometry={pendingGeometry}
                pendingGeometryType={pendingGeometryType || undefined}
                editingField={editingUserField}
                onSave={(data) => {
                  setShowUserFieldEditor(false);
                  setEditingUserField(null);
                }}
                onCancel={() => {
                  setShowUserFieldEditor(false);
                  setEditingUserField(null);
                }}
              />
            }
          >
            <UserFieldsPanel
              isOpen={true}
              onToggle={() => setShowUserFieldsPanel(!showUserFieldsPanel)}
              onFieldVisibilityChange={handleUserFieldVisibilityChange}
              visibleFields={visibleUserFields}
              onEdit={(field) => {
                setEditingUserField(field);
                setShowUserFieldEditor(true);
                setPendingGeometry(null);
                setPendingGeometryType(null);
              }}
            />
          </TwoColumnSidebar>
        </div>
      )}

      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black bg-opacity-75 text-white px-2 sm:px-3 py-1 rounded text-xs">
          Lat: {mouseCoordinates[0].toFixed(4)}° | Lon:{" "}
          {mouseCoordinates[1].toFixed(4)}° | Zoom: {zoom}
        </div>
      </div>
    </div>
  );
}
