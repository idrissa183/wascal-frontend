import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "../../hooks/useTranslations";
import { useGeographicStore } from "../../stores/useGeographicStore";
import { useUserFieldsStore } from "../../stores/useUserFieldsStore";
import { MAP_DEFAULTS, WASCAL_BOUNDS } from "../../constants";
import { GeographicSelections } from "./GeographicSelections";
import { UserFieldsPanel } from "./UserFieldsPanel";
import { UserFieldForm } from "./UserFieldForm";
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
import { Draw, Modify, Select, Translate } from "ol/interaction";
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
  const userFieldOverlayRef = useRef<Overlay | null>(null);
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
  const [showUserFieldForm, setShowUserFieldForm] = useState(false);
  const [pendingGeometry, setPendingGeometry] = useState<any>(null);
  const [pendingGeometryType, setPendingGeometryType] = useState<
    "point" | "polygon" | "circle" | "rectangle" | null
  >(null);
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

  // Create SVG icon data URL for map pin
  const createMapPinIcon = (color: string = "#3b82f6", size: number = 32) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" width="${size}" height="${size}">
      <path fill="${color}" stroke="white" stroke-width="2" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
      <path fill="${color}" stroke="white" stroke-width="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z"/>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

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
            if (geometryType === "point") {
              return new Style({
                image: new Icon({
                  src: createMapPinIcon("#3b82f6", 32),
                  anchor: [0.5, 1], // Anchor at bottom center of the pin
                  anchorXUnits: "fraction",
                  anchorYUnits: "fraction",
                  scale: 1,
                }),
              });
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

    // Interactions for editing features
    const modify = new Modify({
      source: vectorSourceRef.current,
      style: new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: "#ffffff" }),
          stroke: new Stroke({ color: "#ffcc33", width: 2 }),
        }),
      }),
    });
    const select = new Select();
    const translate = new Translate({ features: select.getFeatures() });
    map.addInteraction(select);
    map.addInteraction(translate);
    map.addInteraction(modify);
    modify.setActive(true);
    select.setActive(true);
    translate.setActive(true);
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
      mapInstanceRef.current.removeOverlay(userFieldOverlayRef.current);
      userFieldOverlayRef.current = null;
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
        overlayElement.className = "measure-overlay";
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
          overlayElement.innerHTML = `${(area / 1e6).toFixed(2)} km²`;
          if (position) {
            overlay.setPosition(position);
          }
        };

        geometry.on("change", updateArea);

        draw.once("drawend", () => {
          updateArea();
          geometry.un("change", updateArea);
          mapInstanceRef.current?.removeOverlay(overlay);
          userFieldOverlayRef.current = null;
        });
      });

      draw.on("drawend", (event) => {
        const feature = event.feature;
        const geometry = feature.getGeometry();

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
      mapInstanceRef.current?.removeOverlay(userFieldOverlayRef.current);
      userFieldOverlayRef.current = null;
    }

    const overlayElement = document.createElement('button');
    overlayElement.className =
      'p-1 bg-white rounded-full border border-gray-300 shadow-lg cursor-pointer';
    overlayElement.innerHTML = renderToStaticMarkup(
      <Save className="w-4 h-4 text-blue-600" />
    );

    overlayElement.addEventListener('click', () => {
      setPendingGeometry(geoJsonGeometry);
      setPendingGeometryType(type);
      setShowUserFieldForm(true);
    });

    const overlay = new Overlay({
      element: overlayElement,
      positioning: 'center-center',
      stopEvent: true,
    });

    let overlayCoord;
    if (geometry instanceof Point) {
      overlayCoord = geometry.getCoordinates();
    } else if (geometry instanceof Polygon) {
      overlayCoord = geometry.getInteriorPoint().getCoordinates();
    } else if (geometry instanceof CircleGeom) {
      overlayCoord = geometry.getCenter();
    }

    if (overlayCoord) {
      overlay.setPosition(overlayCoord);
    }

    mapInstanceRef.current?.addOverlay(overlay);
    userFieldOverlayRef.current = overlay;
    console.log('✅ Save overlay added for drawn feature');

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

  const handleUserFieldFormClose = () => {
    console.log("🔄 Closing user field form");
    setShowUserFieldForm(false);
    setPendingGeometry(null);
    setPendingGeometryType(null);

    if (userFieldOverlayRef.current) {
      mapInstanceRef.current?.removeOverlay(userFieldOverlayRef.current);
      userFieldOverlayRef.current = null;
    }

    // Clear the current active tool
    setActiveTool("none");

    // Clear the drawn feature from the vector source
    const features = vectorSourceRef.current?.getFeatures();
    if (features && features.length > 0) {
      vectorSourceRef.current?.removeFeature(features[features.length - 1]);
      console.log("🗑️ Removed drawn feature from vector source");
    }
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

      {/* User Fields Panel */}
      <UserFieldsPanel
        isOpen={showUserFieldsPanel}
        onToggle={() => setShowUserFieldsPanel(!showUserFieldsPanel)}
        onFieldVisibilityChange={handleUserFieldVisibilityChange}
        visibleFields={visibleUserFields}
      />

      {/* User Field Form */}
      <UserFieldForm
        isOpen={showUserFieldForm}
        onClose={handleUserFieldFormClose}
        geometry={pendingGeometry}
        geometryType={pendingGeometryType || "polygon"}
        onSuccess={(savedField) => {
          // Auto-enable visibility for the new field
          if (savedField && savedField.id) {
            const newVisibleFields = new Set(visibleUserFields);
            newVisibleFields.add(savedField.id);
            setVisibleUserFields(newVisibleFields);
          }
        }}
      />

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
