import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import { useGeographicStore } from "../../stores/useGeographicStore";
import { useUserFieldsStore } from "../../stores/useUserFieldsStore";
import { MAP_DEFAULTS, WASCAL_BOUNDS } from "../../constants";
import { GeographicSelections } from "./GeographicSelections";
import { UserFieldsPanel } from "./UserFieldsPanel";
import { TwoColumnSidebar } from "./TwoColumnSidebar";
import { UserFieldEditor } from "./UserFieldEditor";
import { AreaDisplay } from "./AreaDisplay";
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
import { Draw, Modify, Select, Translate, Pointer } from "ol/interaction";
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
import { Save } from "lucide-react";
import Overlay from "ol/Overlay";
import { getArea } from "ol/sphere";

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
  const rectangleInteractionRef = useRef<any>(null);
  const userFieldOverlayRef = useRef<Overlay | null>(null);
  const rectangleHandlesSourceRef = useRef<VectorSource>(new VectorSource());
  const t = useTranslations();
  const { selectedEntities, isLoadingGeometry } = useGeographicStore();
  const { userFields } = useUserFieldsStore();

  // Ref for geographic layers
  const geographicSourceRef = useRef<VectorSource>(new VectorSource());
  // Ref for user fields layers
  const userFieldsSourceRef = useRef<VectorSource>(new VectorSource());

  // États pour les contrôles de la carte
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState<SelectionTool>("none");
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // États pour les champs utilisateur
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

  // États pour les coordonnées dynamiques
  const [mouseCoordinates, setMouseCoordinates] = useState<[number, number]>([
    MAP_DEFAULTS.CENTER[0],
    MAP_DEFAULTS.CENTER[1],
  ]);
  const [zoom, setZoom] = useState<number>(MAP_DEFAULTS.ZOOM);
  const locationIconUrl = `data:image/svg+xml,${encodeURIComponent(
    renderToStaticMarkup(<FaLocationDot />)
  )}`;
  const pointStyle = new Style({
    image: new Icon({
      src: locationIconUrl,
      anchor: [0.5, 1],
      height: 48,
      width: 48,
    }),
  });

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

  // Effect to handle geographic selections
  useEffect(() => {
    if (!geographicSourceRef.current) return;

    // Clear existing features
    geographicSourceRef.current.clear();

    // Add features for selected entities that have geometry loaded
    selectedEntities.forEach((entity) => {
      if (entity.geometry && !entity.isLoading && !entity.error) {
        try {
          console.log(
            `🗺️ Processing geometry for ${entity.type} ${entity.id}:`,
            entity.geometry
          );
          // Parse GeoJSON geometry
          const geometryData = entity.geometry;

          // Create OpenLayers geometry from GeoJSON
          let olGeometry: Geometry;

          if (geometryData.type === "Polygon") {
            // Handle Polygon: coordinates is [LinearRing, ...holes]
            const rings = geometryData.coordinates.map(
              (ring: [number, number][]) =>
                ring.map((coord: [number, number]) =>
                  fromLonLat([coord[0], coord[1]])
                )
            );
            olGeometry = new Polygon(rings);
          } else if (geometryData.type === "MultiPolygon") {
            // Handle MultiPolygon: coordinates is [Polygon, Polygon, ...]
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
            // Handle Point geometry
            const coord = fromLonLat([
              geometryData.coordinates[0],
              geometryData.coordinates[1],
            ]);
            olGeometry = new Point(coord);
          } else {
            console.warn(`Unsupported geometry type: ${geometryData.type}`);
            // Fallback to center point for unsupported types
            olGeometry = new Point(fromLonLat([0, 0]));
          }

          const feature = new Feature({
            geometry: olGeometry,
            name: entity.name,
            type: entity.type,
            entityId: entity.id,
          });

          // Set style based on entity type
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
          console.log(
            `✅ Successfully added feature to map for ${entity.type} ${entity.id}`
          );
        } catch (error) {
          console.error(
            `❌ Error adding feature for ${entity.type} ${entity.id}:`,
            error
          );
          console.error(`📍 Geometry data:`, entity.geometry);
        }
      }
    });

    // Auto-zoom to fit all geographic features if any exist
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

  // // Create SVG icon data URL for map pin
  // const createMapPinIcon = (color: string = "#3b82f6", size: number = 32) => {
  //   const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" width="${size}" height="${size}">
  //     <path fill="${color}" stroke="white" stroke-width="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
  //     <path fill="${color}" stroke="white" stroke-width="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z"/>
  //   </svg>`;
  //   return `data:image/svg+xml;base64,${btoa(svg)}`;
  // };

  // Effect to handle user fields display
  useEffect(() => {
    if (!userFieldsSourceRef.current) return;

    // Clear existing features
    userFieldsSourceRef.current.clear();

    // Add features for visible user fields
    userFields.forEach((field) => {
      if (visibleUserFields.has(field.id) && field.geometry) {
        try {
          const geoJson = field.geometry;
          let olGeometry: Geometry;

          // Convert GeoJSON to OpenLayers geometry
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
            // Handle circle geometry - assuming it has center and radius
            const center = fromLonLat([
              geoJson.coordinates[0],
              geoJson.coordinates[1],
            ]);
            const radius = geoJson.radius || 1000; // default 1km radius
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

          // Set style based on geometry type
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

    // Couche pour les handles des rectangles
    const rectangleHandlesLayer = new VectorLayer({
      source: rectangleHandlesSourceRef.current,
      style: new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: "#ffffff" }),
          stroke: new Stroke({ color: "#007cba", width: 3 }),
        }),
      }),
      zIndex: 1000, // High z-index to appear on top
    });

    // Contrôle de position de souris dynamique
    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: "EPSG:4326",
      placeholder: "&nbsp;",
      className: "custom-mouse-position",
    });

    // Contrôle d'échelle personnalisé
    const scaleLineControl = new ScaleLine({
      units: "metric",
      className: "custom-scale-line",
      minWidth: 80,
    });

    // Créer la carte sans les contrôles par défaut qui sont redondants
    // Geographic selections layer
    const geographicLayer = new VectorLayer({
      source: geographicSourceRef.current,
      style: new Style({
        fill: new Fill({
          color: "rgba(16, 185, 129, 0.2)", // Green with transparency
        }),
        stroke: new Stroke({
          color: "#10b981", // Green
          width: 2,
        }),
      }),
    });

    // User fields layer
    const userFieldsLayer = new VectorLayer({
      source: userFieldsSourceRef.current,
      style: new Style({
        fill: new Fill({
          color: "rgba(59, 130, 246, 0.3)", // Blue with transparency
        }),
        stroke: new Stroke({
          color: "#3b82f6", // Blue
          width: 2,
        }),
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({
            color: "#3b82f6",
          }),
          stroke: new Stroke({
            color: "white",
            width: 2,
          }),
        }),
      }),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        osmLayer,
        satelliteLayer,
        vectorLayer,
        rectangleHandlesLayer,
        geographicLayer,
        userFieldsLayer,
      ],
      view: new View({
        center: fromLonLat([MAP_DEFAULTS.CENTER[1], MAP_DEFAULTS.CENTER[0]]), // Longitude, Latitude
        zoom: MAP_DEFAULTS.ZOOM,
        minZoom: MAP_DEFAULTS.MIN_ZOOM,
        maxZoom: MAP_DEFAULTS.MAX_ZOOM,
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

    // Custom interaction for rectangle editing
    const createRectangleEditor = () => {
      const modify = new Modify({
        source: vectorSourceRef.current,
        condition: (event) => {
          // Only allow modification for non-rectangle features or use custom rectangle logic
          const feature = map.forEachFeatureAtPixel(
            event.pixel,
            (feature) => feature
          );
          if (feature && feature.get("geometryType") === "rectangle") {
            return false; // Disable default modify for rectangles
          }
          return true;
        },
        deleteCondition: () => false,
        insertVertexCondition: () => false,
        style: new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: "#ffffff" }),
            stroke: new Stroke({ color: "#ffcc33", width: 2 }),
          }),
        }),
      });

      return modify;
    };

    // Custom rectangle handles interaction using Pointer
    const createCustomRectangleInteraction = () => {
      class RectangleHandleInteraction extends Pointer {
        private draggedCorner: string | null = null;
        private originalExtent: number[] | null = null;
        private activeFeature: any = null;

        handleDownEvent(event: any): boolean {
          const pixel = event.pixel;

          // Check if clicking on a handle first
          const handleFeature = this.getMap()?.forEachFeatureAtPixel(
            pixel,
            (feature) => {
              if (feature.get("handleType") === "rectangle-corner") {
                return feature;
              }
              return null;
            }
          );

          if (handleFeature) {
            const parentFeature = handleFeature.get("parentFeature");
            const cornerIndex = handleFeature.get("cornerIndex");
            const geometry = parentFeature.getGeometry() as Polygon;

            const cornerNames = [
              "bottom-left",
              "bottom-right",
              "top-right",
              "top-left",
            ];
            this.draggedCorner = cornerNames[cornerIndex];
            this.originalExtent = [...geometry.getExtent()];
            this.activeFeature = parentFeature;
            return true;
          }

          // Check if clicking on a rectangle to show handles
          const rectangleFeature = this.getMap()?.forEachFeatureAtPixel(
            pixel,
            (feature) => {
              if (feature.get("geometryType") === "rectangle") {
                return feature;
              }
              return null;
            }
          );

          if (rectangleFeature) {
            showRectangleHandles(rectangleFeature);
          } else {
            hideRectangleHandles();
          }

          return false;
        }

        handleDragEvent(event: any): void {
          if (this.draggedCorner && this.originalExtent && this.activeFeature) {
            const currentCoord = this.getMap()?.getCoordinateFromPixel(
              event.pixel
            );
            if (!currentCoord) return;

            const geometry = this.activeFeature.getGeometry() as Polygon;
            let newExtent = [...this.originalExtent];

            // Update extent based on dragged corner
            switch (this.draggedCorner) {
              case "bottom-left":
                newExtent[0] = currentCoord[0]; // left
                newExtent[1] = currentCoord[1]; // bottom
                break;
              case "bottom-right":
                newExtent[2] = currentCoord[0]; // right
                newExtent[1] = currentCoord[1]; // bottom
                break;
              case "top-right":
                newExtent[2] = currentCoord[0]; // right
                newExtent[3] = currentCoord[1]; // top
                break;
              case "top-left":
                newExtent[0] = currentCoord[0]; // left
                newExtent[3] = currentCoord[1]; // top
                break;
            }

            // Create new rectangle coordinates
            const newCoords = [
              [newExtent[0], newExtent[1]], // bottom-left
              [newExtent[2], newExtent[1]], // bottom-right
              [newExtent[2], newExtent[3]], // top-right
              [newExtent[0], newExtent[3]], // top-left
              [newExtent[0], newExtent[1]], // close
            ];

            geometry.setCoordinates([newCoords]);
            updateSaveIconPosition(this.activeFeature);
            showRectangleHandles(this.activeFeature); // Update handles position
          }
        }

        handleUpEvent(event: any): boolean {
          this.draggedCorner = null;
          this.originalExtent = null;
          this.activeFeature = null;
          return false;
        }
      }

      return new RectangleHandleInteraction();
    };

    // Interactions for editing features
    const modify = createRectangleEditor();
    const select = new Select();
    const translate = new Translate({ features: select.getFeatures() });

    // Add listeners to update save icon position during modifications
    let currentModifyHandler: any = null;
    let currentTranslateHandler: any = null;

    modify.on("modifystart", (event) => {
      const modifiedFeatures = event.features.getArray();
      if (modifiedFeatures.length > 0) {
        const feature = modifiedFeatures[0];
        const geometry = feature.getGeometry();
        if (geometry) {
          // Add real-time rectangle shape maintenance during modification
          const rectangleHandler = () => {
            // Only apply rectangle constraints to features marked as rectangles
            if (
              feature.get("geometryType") === "rectangle" &&
              geometry instanceof Polygon
            ) {
              const coordinates = geometry.getCoordinates()[0];
              if (coordinates.length === 5) {
                // Rectangle
                const correctedCoords = maintainRectangleShape(coordinates);
                geometry.setCoordinates([correctedCoords]);
              }
            }
            updateSaveIconPosition(feature);
          };

          currentModifyHandler = rectangleHandler;
          geometry.on("change", currentModifyHandler);
        }
      }
    });

    modify.on("modifyend", (event) => {
      const modifiedFeatures = event.features.getArray();
      if (modifiedFeatures.length > 0) {
        const feature = modifiedFeatures[0];
        const geometry = feature.getGeometry();

        // Ensure rectangles maintain their rectangular shape
        if (
          feature.get("geometryType") === "rectangle" &&
          geometry instanceof Polygon
        ) {
          const coordinates = geometry.getCoordinates()[0];
          if (coordinates.length === 5) {
            // Rectangle
            const correctedCoords = maintainRectangleShape(coordinates);
            geometry.setCoordinates([correctedCoords]);
          }
        }

        if (geometry && currentModifyHandler) {
          geometry.un("change", currentModifyHandler);
          currentModifyHandler = null;
        }
        updateSaveIconPosition(feature);
      }
    });

    translate.on("translatestart", (event) => {
      const translatedFeatures = event.features.getArray();
      if (translatedFeatures.length > 0) {
        const feature = translatedFeatures[0];
        const geometry = feature.getGeometry();
        if (geometry) {
          currentTranslateHandler = () => updateSaveIconPosition(feature);
          geometry.on("change", currentTranslateHandler);
        }
      }
    });

    translate.on("translating", (event) => {
      const translatedFeatures = event.features.getArray();
      if (translatedFeatures.length > 0) {
        updateSaveIconPosition(translatedFeatures[0]);
      }
    });

    translate.on("translateend", (event) => {
      const translatedFeatures = event.features.getArray();
      if (translatedFeatures.length > 0) {
        const feature = translatedFeatures[0];
        const geometry = feature.getGeometry();
        if (geometry && currentTranslateHandler) {
          geometry.un("change", currentTranslateHandler);
          currentTranslateHandler = null;
        }
        updateSaveIconPosition(feature);
      }
    });

    // Initialize custom rectangle interaction
    const rectangleInteraction = createCustomRectangleInteraction();
    rectangleInteractionRef.current = rectangleInteraction;

    map.addInteraction(select);
    map.addInteraction(translate);
    map.addInteraction(modify);
    map.addInteraction(rectangleInteraction);
    modify.setActive(true);
    select.setActive(true);
    translate.setActive(true);
    rectangleInteraction.setActive(true);
    modifyRef.current = modify;
    selectRef.current = select;
    translateRef.current = translate;

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

    vectorSourceRef.current.on("removefeature", (event) => {
      if (userFieldOverlayRef.current) {
        const associatedFeature = (userFieldOverlayRef.current as any)
          .associatedFeature;
        if (associatedFeature === event.feature) {
          mapInstanceRef.current?.removeOverlay(userFieldOverlayRef.current);
          userFieldOverlayRef.current = null;
        }
      }
    });

    //   // Ajouter quelques points d'exemple
    //   addSampleData();
    // };

    // const addSampleData = () => {
    //   if (!vectorSourceRef.current) return;

    //   // Ajouter quelques stations météo d'exemple
    //   const stations = [
    //     { name: "Ouagadougou", coords: [-1.5197, 12.3714] },
    //     { name: "Bobo-Dioulasso", coords: [-4.2945, 11.1777] },
    //     { name: "Koudougou", coords: [-2.3667, 12.2533] },
    //     { name: "Banfora", coords: [-4.75, 10.6333] },
    //   ];

    //   stations.forEach((station) => {
    //     const point = new Point(fromLonLat(station.coords));
    //     const feature = new Feature({
    //       geometry: point,
    //       name: station.name,
    //       type: "station",
    //     });

    //     feature.setStyle(
    //       new Style({
    //         image: new CircleStyle({
    //           radius: 6,
    //           fill: new Fill({ color: "#3b82f6" }),
    //           stroke: new Stroke({ color: "#1e40af", width: 2 }),
    //         }),
    //       })
    //     );

    //     vectorSourceRef.current?.addFeature(feature);
    //   });
  };

  const handleToolChange = (tool: SelectionTool) => {
    if (!mapInstanceRef.current) return;

    // Supprimer l'interaction précédente
    if (drawRef.current) {
      mapInstanceRef.current.removeInteraction(drawRef.current);
      drawRef.current = null;
    }

    if (userFieldOverlayRef.current) {
      removeSaveIconOverlay();
    }

    if (tool === activeTool || tool === "none") {
      setActiveTool("none");
      modifyRef.current?.setActive(true);
      selectRef.current?.setActive(true);
      translateRef.current?.setActive(true);
      return;
    }

    // Disable editing interactions while drawing
    modifyRef.current?.setActive(false);
    selectRef.current?.setActive(false);
    translateRef.current?.setActive(false);

    let geometryType: string | undefined;
    const drawOptions: any = {
      source: vectorSourceRef.current,
    };
    switch (tool) {
      case "point":
        geometryType = "Point";
        drawOptions.style = pointStyle;
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

      draw.on("drawstart", (event) => {
        const overlayElement = document.createElement("div");
        const overlay = new Overlay({
          element: overlayElement,
          positioning: "bottom-center",
          offset: [0, -7],
        });
        userFieldOverlayRef.current = overlay;
        mapInstanceRef.current?.addOverlay(overlay);

        const geometry = event.feature.getGeometry();
        if (!geometry) {
          return;
        }
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

          // Use AreaDisplay component for consistent formatting
          overlayElement.innerHTML = `<div class="px-3 py-2 bg-blue-600 text-white rounded-lg shadow-lg border border-blue-700">
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2"/>
              </svg>
              <span class="text-sm font-medium">${
                area >= 1000000
                  ? (area / 1000000).toFixed(2) + " km²"
                  : area >= 10000
                  ? (area / 10000).toFixed(2) + " ha"
                  : area.toFixed(0) + " m²"
              }</span>
            </div>
          </div>`;

          setCurrentDrawingArea(area);
          if (position) {
            overlay.setPosition(position);
          }
        };

        geometry.on("change", updateArea);

        draw.once("drawend", () => {
          updateArea();
          geometry.un("change", updateArea);
          removeSaveIconOverlay();
        });
      });

      draw.on("drawend", (event) => {
        const feature = event.feature;
        const geometry = feature.getGeometry();

        // Mark rectangle features for special handling
        if (tool === "rectangle") {
          feature.set("geometryType", "rectangle");
        }

        if (tool === "point") {
          feature.setStyle(pointStyle);
        }

        let coordinates: unknown = undefined;
        if (geometry) {
          if (geometry instanceof Point || geometry instanceof Polygon) {
            coordinates = geometry.getCoordinates();
          } else if (geometry instanceof CircleGeom) {
            coordinates = {
              center: geometry.getCenter(),
              radius: geometry.getRadius(),
            };
          }
        }

        handleUserFieldDrawEnd(geometry || null, tool);
        setShowUserFieldsPanel(true);

        if (onSelectionChange) {
          onSelectionChange({
            type: tool,
            geometry: geometry as Geometry,
            coordinates: coordinates,
          });
        }

        if (coordinates) {
          console.log(`${tool} drawn:`, coordinates);
        }
        // Reactivate editing interactions and select the drawn feature
        modifyRef.current?.setActive(true);
        selectRef.current?.setActive(true);
        translateRef.current?.setActive(true);
        selectRef.current?.getFeatures().clear();
        selectRef.current?.getFeatures().push(feature);

        // Remove draw interaction to allow modification of the geometry
        mapInstanceRef.current?.removeInteraction(draw);
        drawRef.current = null;
        setActiveTool("none");
      });

      mapInstanceRef.current.addInteraction(draw);
      drawRef.current = draw;
    }

    setActiveTool(tool);
  };

  // Helper function to maintain rectangle shape during modification
  const maintainRectangleShape = (coordinates: number[][]) => {
    if (coordinates.length !== 5) return coordinates;

    // Get the four corners (excluding the closing point)
    const corners = coordinates.slice(0, 4);

    // Find which corner was moved by comparing with the original rectangle
    // For now, we'll reconstruct a proper rectangle from the modified coordinates
    const minX = Math.min(...corners.map((c) => c[0]));
    const maxX = Math.max(...corners.map((c) => c[0]));
    const minY = Math.min(...corners.map((c) => c[1]));
    const maxY = Math.max(...corners.map((c) => c[1]));

    // Return a proper rectangle with 90-degree angles
    return [
      [minX, minY], // bottom-left
      [maxX, minY], // bottom-right
      [maxX, maxY], // top-right
      [minX, maxY], // top-left
      [minX, minY], // close the ring
    ];
  };

  // Helper functions for rectangle handles
  const showRectangleHandles = (feature: any) => {
    if (!feature || feature.get("geometryType") !== "rectangle") return;

    const geometry = feature.getGeometry() as Polygon;
    const extent = geometry.getExtent();

    rectangleHandlesSourceRef.current?.clear();

    // Create handle points at corners
    const corners = [
      [extent[0], extent[1]], // bottom-left
      [extent[2], extent[1]], // bottom-right
      [extent[2], extent[3]], // top-right
      [extent[0], extent[3]], // top-left
    ];

    corners.forEach((corner, index) => {
      const handleFeature = new Feature({
        geometry: new Point(corner),
      });
      handleFeature.set("handleType", "rectangle-corner");
      handleFeature.set("cornerIndex", index);
      handleFeature.set("parentFeature", feature);
      rectangleHandlesSourceRef.current?.addFeature(handleFeature);
    });
  };

  const hideRectangleHandles = () => {
    rectangleHandlesSourceRef.current?.clear();
  };

  // Helper function to update save icon position
  const updateSaveIconPosition = (feature: any) => {
    if (!userFieldOverlayRef.current) return;

    // Check if this feature is the one associated with the save icon
    const associatedFeature = (userFieldOverlayRef.current as any)
      .associatedFeature;
    if (associatedFeature && associatedFeature !== feature) return;

    const geometry = feature.getGeometry();
    if (!geometry) return;

    let overlayCoord;
    if (geometry instanceof Point) {
      overlayCoord = geometry.getCoordinates();
    } else if (geometry instanceof Polygon) {
      const extent = geometry.getExtent();
      overlayCoord = [(extent[0] + extent[2]) / 2, extent[1]];
    } else if (geometry instanceof CircleGeom) {
      const center = geometry.getCenter();
      const radius = geometry.getRadius();
      overlayCoord = [center[0], center[1] - radius];
    }

    if (overlayCoord) {
      userFieldOverlayRef.current.setPosition(overlayCoord);
    }
  };

  // Helper to remove save icon overlay and detach listeners
  const removeSaveIconOverlay = () => {
    if (!userFieldOverlayRef.current) return;

    const overlay = userFieldOverlayRef.current as any;
    const associatedFeature = overlay.associatedFeature;
    const geometryListener = overlay.geometryChangeListener;

    if (associatedFeature && geometryListener) {
      const geometry = associatedFeature.getGeometry();
      if (geometry) {
        geometry.un("change", geometryListener);
      }
    }

    mapInstanceRef.current?.removeOverlay(userFieldOverlayRef.current);
    userFieldOverlayRef.current = null;
  };

  const handleUserFieldDrawEnd = (
    geometry: Geometry | null,
    type: "point" | "polygon" | "circle" | "rectangle"
  ) => {
    console.log("🚀 handleUserFieldDrawEnd called:", { geometry, type });
    if (!geometry) {
      console.log("❌ No geometry provided, returning");
      return;
    }

    // Convert OpenLayers geometry to GeoJSON
    let geoJsonGeometry: any;

    if (geometry instanceof Point) {
      const coord = toLonLat(geometry.getCoordinates());
      geoJsonGeometry = {
        type: "Point",
        coordinates: coord,
      };
    } else if (geometry instanceof Polygon) {
      const rings = geometry
        .getCoordinates()
        .map((ring) => ring.map((coord) => toLonLat(coord)));
      geoJsonGeometry = {
        type: "Polygon",
        coordinates: rings,
      };
    } else if (geometry instanceof CircleGeom) {
      const center = toLonLat(geometry.getCenter());
      const radius = geometry.getRadius();
      // For circles, we'll store center and radius
      if (type === "circle") {
        geoJsonGeometry = {
          type: "Circle",
          coordinates: center,
          radius: radius,
        };
      } else {
        // For rectangles drawn as boxes, convert to polygon
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
        geoJsonGeometry = {
          type: "Polygon",
          coordinates: coords,
        };
      }
    }

    // Create overlay with save icon
    if (userFieldOverlayRef.current) {
      removeSaveIconOverlay();
    }

    const overlayElement = document.createElement("button");
    overlayElement.className =
      "p-2 bg-white rounded-full border border-gray-300 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors";
    overlayElement.title = "Enregistrer";
    overlayElement.innerHTML = renderToStaticMarkup(
      <Save className="w-4 h-4 text-blue-600" />
    );

    overlayElement.addEventListener("click", () => {
      setPendingGeometry(geoJsonGeometry);
      setPendingGeometryType(type);
      setShowUserFieldEditor(true);
      setEditingUserField(null);
    });

    const overlay = new Overlay({
      element: overlayElement,
      positioning: "top-center",
      offset: [0, 10],
      stopEvent: true,
    });

    let overlayCoord;
    if (geometry instanceof Point) {
      overlayCoord = geometry.getCoordinates();
    } else if (geometry instanceof Polygon) {
      // Get the bottom center of the polygon's extent
      const extent = geometry.getExtent();
      overlayCoord = [(extent[0] + extent[2]) / 2, extent[1]]; // center X, bottom Y
    } else if (geometry instanceof CircleGeom) {
      // Get the bottom center of the circle
      const center = geometry.getCenter();
      const radius = geometry.getRadius();
      overlayCoord = [center[0], center[1] - radius]; // center X, bottom Y
    }

    if (overlayCoord) {
      overlay.setPosition(overlayCoord);
    }

    mapInstanceRef.current?.addOverlay(overlay);
    userFieldOverlayRef.current = overlay;

    // Store reference to the feature that has the save icon
    const lastFeature = vectorSourceRef.current?.getFeatures().slice(-1)[0];
    if (lastFeature) {
      (overlay as any).associatedFeature = lastFeature;
      const geom = lastFeature.getGeometry();
      if (geom) {
        const listener = () => updateSaveIconPosition(lastFeature);
        geom.on("change", listener);
        (overlay as any).geometryChangeListener = listener;
      }
    }

    console.log("✅ Save overlay added for drawn feature");

    // // Set pending geometry and show form
    // console.log("📝 Setting pending geometry and opening form:", {
    //   geoJsonGeometry,
    //   type,
    // });
    // setPendingGeometry(geoJsonGeometry);
    // setPendingGeometryType(type);
    // setShowUserFieldForm(true);
    // console.log("✅ Form should be open now");
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
    // Remove save icon overlay when cutting all features
    if (userFieldOverlayRef.current) {
      removeSaveIconOverlay();
    }

    // Clear all features
    vectorSourceRef.current?.clear();
  };

  const handleUndo = () => {
    const features = vectorSourceRef.current?.getFeatures();
    if (features && features.length > 0) {
      const lastFeature = features[features.length - 1];

      // Check if the feature being removed is associated with the save icon
      if (userFieldOverlayRef.current) {
        const associatedFeature = (userFieldOverlayRef.current as any)
          .associatedFeature;
        if (associatedFeature === lastFeature) {
          removeSaveIconOverlay();
        }
      }

      vectorSourceRef.current?.removeFeature(lastFeature);
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
                const matrixValues = transform
                  .match(/^matrix\(([^(]*)\)$/)?.[1]
                  .split(",")
                  .map(Number);
                if (matrixValues && matrixValues.length === 6) {
                  mapContext.setTransform(
                    matrixValues[0],
                    matrixValues[1],
                    matrixValues[2],
                    matrixValues[3],
                    matrixValues[4],
                    matrixValues[5]
                  );
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
      view.setCenter(
        fromLonLat([MAP_DEFAULTS.CENTER[1], MAP_DEFAULTS.CENTER[0]])
      );
      view.setZoom(MAP_DEFAULTS.ZOOM);
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

                {/* <svg
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
                </svg> */}
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

      {/* Bouton pour réafficher le panneau de couches */}
      {!showLayerPanel && (
        <button
          onClick={() => setShowLayerPanel(true)}
          className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 z-30 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
          <span className="sr-only">ChevronUpBtn</span>
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

      {/* Geographic Selections Panel */}
      <GeographicSelections />

      {/* Geographic loading indicator */}
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

      {/* Two Column Sidebar with User Fields */}
      {showUserFieldsPanel && (
        <div className="absolute top-0 right-0 h-full z-30">
          <TwoColumnSidebar
            isRightColumnVisible={showUserFieldEditor}
            onRightColumnToggle={(visible) => {
              setShowUserFieldEditor(visible);
              if (!visible) {
                setEditingUserField(null);
                if (userFieldOverlayRef.current) {
                  removeSaveIconOverlay();
                }
              }
            }}
            rightColumnContent={
              <UserFieldEditor
                pendingGeometry={pendingGeometry}
                pendingGeometryType={pendingGeometryType || undefined}
                editingField={editingUserField}
                onSave={(data) => {
                  console.log("Field saved:", data);
                  setShowUserFieldEditor(false);
                  setEditingUserField(null);
                  if (userFieldOverlayRef.current) {
                    removeSaveIconOverlay();
                  }
                }}
                onCancel={() => {
                  setShowUserFieldEditor(false);
                  setEditingUserField(null);
                  if (userFieldOverlayRef.current) {
                    removeSaveIconOverlay();
                  }
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

      {/* Legacy User Field Form - Replaced by UserFieldEditor in TwoColumnSidebar */}

      {/* Drawing indicator for user fields */}
      {showUserFieldsPanel && activeTool !== "none" && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-600 text-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">
              Dessinez votre{" "}
              {activeTool === "point"
                ? "point"
                : activeTool === "rectangle"
                ? "rectangle"
                : activeTool === "circle"
                ? "cercle"
                : "polygone"}{" "}
              pour créer un champ...
            </span>
          </div>
        </div>
      )}

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
