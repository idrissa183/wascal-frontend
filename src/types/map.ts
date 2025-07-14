export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: "admin" | "user";
  creatAt: string;
  updateAt: string;
  preferences: Preferences;
}

export interface Preferences {
  theme: "dark" | "light" | "system";
  language: "en" | "fr";
  notifications: boolean;
}

export interface DataLayer {
  id: string;
  name: string;
  type: "climate" | "vegetation" | "temperature" | "precipitation";
  source: string;
  visible: boolean;
  opacity: number;
  temporalRange: {
    start: Date;
    end: Date;
  };
}

export interface GeographicArea {
  id: string;
}
