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
  name: string;
  type: 'country' | 'region' | 'province' | 'department';
  parent_id?: number;
  geometry?: any;
  properties?: Record<string, any>;
}

export interface Country {
  id: number;
  shape_name: string;
  shape_name_en?: string;
  shape_name_fr?: string;
  shape_iso?: string;
  shape_iso_2?: string;
  shape_id?: string;
  shape_group?: string;
  shape_type?: string;
  shape_city?: string;
  shape_area_km2?: number;
  shape_people?: number;
  created_at?: string;
  updated_at?: string;
  geometry?: any;
}

export interface Region {
  id: number;
  shape_name: string;
  country_id: number;
  shape_iso?: string;
  shape_id?: string;
  shape_group?: string;
  shape_type?: string;
  shape_area_km2?: number;
  shape_people?: number;
  created_at?: string;
  updated_at?: string;
  geometry?: any;
}

export interface Province {
  id: number;
  shape_name: string;
  region_id: number;
  shape_iso?: string;
  shape_id?: string;
  shape_group?: string;
  shape_type?: string;
  shape_area_km2?: number;
  shape_people?: number;
  created_at?: string;
  updated_at?: string;
  geometry?: any;
}

export interface Department {
  id: number;
  shape_name: string;
  province_id: number;
  shape_iso?: string;
  shape_id?: string;
  shape_group?: string;
  shape_type?: string;
  shape_area_km2?: number;
  shape_people?: number;
  created_at?: string;
  updated_at?: string;
  geometry?: any;
}

export interface GeographicFilter {
  countries: number[];
  regions: number[];
  provinces: number[];
  departments: number[];
}

export interface MapSelection {
  type: 'point' | 'rectangle' | 'polygon' | 'circle';
  geometry: any;
  coordinates: any;
}
