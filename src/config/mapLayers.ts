export interface LayerConfig {
  id: string;
  nameKey: string;
  visible: boolean;
  opacity: number;
  type: "raster" | "vector";
}

export const DEFAULT_LAYERS: LayerConfig[] = [
  { id: "osm", nameKey: "osm", visible: true, opacity: 100, type: "raster" },
  { id: "satellite", nameKey: "satellite", visible: false, opacity: 100, type: "raster" },
  { id: "ndvi", nameKey: "ndvi", visible: false, opacity: 70, type: "raster" },
  { id: "temperature", nameKey: "temperature", visible: false, opacity: 70, type: "raster" },
  { id: "precipitation", nameKey: "precipitation", visible: false, opacity: 70, type: "raster" },
  { id: "boundaries", nameKey: "boundaries", visible: true, opacity: 80, type: "vector" },
];