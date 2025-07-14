export const APP_NAME = "EcoWatch";
export const APP_VERSION = "1.0.0";
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.ecowatch.com"
    : "http://localhost:8000";

export const SUPPORTED_LANGUAGES = ["fr", "en"] as const;
export const DEFAULT_LANGUAGE = "fr";

export const THEMES = ["light", "dark", "system"] as const;
export const DEFAULT_THEME = "system";

export const DATA_SOURCES = {
  CLIMATE: ["ERA5", "Climate Engine"],
  VEGETATION: ["MODIS", "Sentinel-2"],
  TEMPERATURE: ["MODIS", "ERA5"],
  PRECIPITATION: ["CHIRPS", "ERA5", "GPM"],
} as const;

export const MAP_DEFAULTS = {
  CENTER: [12.3714, -1.5197], // Ouagadougou coordinates
  ZOOM: 7,
  MIN_ZOOM: 1,
  MAX_ZOOM: 20,
} as const;

export const CHART_COLORS = {
  PRIMARY: "#10b981",
  SECONDARY: "#0ea5e9",
  ACCENT: "#eab308",
  DANGER: "#ef4444",
  WARNING: "#f59e0b",
  SUCCESS: "#10b981",
} as const;
