// src/constants/index.ts
export const APP_NAME = "EcoWatch";
export const APP_VERSION = "1.0.0";

// Configuration de l'API
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production"
    ? "https://api.ecowatch.com"
    : "http://localhost:8000");

// Langues supportées
export const SUPPORTED_LANGUAGES = ["fr", "en"] as const;
export const DEFAULT_LANGUAGE = "fr";

// Thèmes supportés
export const THEMES = ["light", "dark", "system"] as const;
export const DEFAULT_THEME = "system";

// Configuration des données
export const DATA_SOURCES = {
  CLIMATE: ["ERA5", "Climate Engine"],
  VEGETATION: ["MODIS", "Sentinel-2"],
  TEMPERATURE: ["MODIS", "ERA5"],
  PRECIPITATION: ["CHIRPS", "ERA5", "GPM"],
} as const;

// Configuration de la carte
export const MAP_DEFAULTS = {
  CENTER: [12.3714, -1.5197], // Coordonnées de Ouagadougou
  ZOOM: 7,
  MIN_ZOOM: 1,
  MAX_ZOOM: 20,
} as const;

// Couleurs des graphiques
export const CHART_COLORS = {
  PRIMARY: "#10b981",
  SECONDARY: "#0ea5e9",
  ACCENT: "#eab308",
  DANGER: "#ef4444",
  WARNING: "#f59e0b",
  SUCCESS: "#10b981",
} as const;

// Configuration de l'authentification
export const AUTH_CONFIG = {
  TOKEN_KEY: "access_token",
  REFRESH_TOKEN_KEY: "refresh_token",
  USER_KEY: "user",
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes en millisecondes
} as const;

// Routes publiques (ne nécessitent pas d'authentification)
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/callback/*", // Toutes les routes de callback OAuth
] as const;

// Routes protégées (nécessitent une authentification)
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/dashboard/*",
  "/map",
  "/analytics",
  "/monitoring",
  "/predictions",
  "/alerts",
  "/reports",
  "/settings",
  "/profile",
  "/admin/*",
] as const;

// Routes qui nécessitent d'être déconnecté
export const GUEST_ONLY_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
] as const;

// Messages d'erreur par défaut
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Erreur de connexion réseau",
  UNAUTHORIZED: "Non autorisé",
  FORBIDDEN: "Accès interdit",
  NOT_FOUND: "Ressource non trouvée",
  SERVER_ERROR: "Erreur serveur interne",
  VALIDATION_ERROR: "Erreur de validation",
  SESSION_EXPIRED: "Session expirée",
  OAUTH_ERROR: "Erreur d'authentification OAuth",
} as const;

// Configuration des notifications
export const NOTIFICATION_CONFIG = {
  DURATION: 5000, // 5 secondes
  POSITION: "top-right",
} as const;

// Formats de date
export const DATE_FORMATS = {
  SHORT: "DD/MM/YYYY",
  LONG: "DD MMMM YYYY",
  WITH_TIME: "DD/MM/YYYY HH:mm",
  ISO: "YYYY-MM-DD",
} as const;

// Validation des mots de passe
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
} as const;

// Configuration des fichiers
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
} as const;

// Configuration OAuth
export const OAUTH_CONFIG = {
  PROVIDERS: {
    GOOGLE: "google",
    GITHUB: "github",
  },
  CALLBACK_ROUTES: {
    GOOGLE: "/auth/callback/google",
    GITHUB: "/auth/callback/github",
  },
  SCOPES: {
    GOOGLE: ["openid", "email", "profile"],
    GITHUB: ["user:email"],
  },
} as const;

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "ecowatch_auth_token",
  REFRESH_TOKEN: "ecowatch_refresh_token",
  USER_DATA: "ecowatch_user_data",
  LANGUAGE: "ecowatch_language",
  THEME: "ecowatch_theme",
  OAUTH_STATE: "ecowatch_oauth_state",
} as const;
