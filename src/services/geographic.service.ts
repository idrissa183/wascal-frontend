/**
 * Service pour l'interaction avec l'API géographique
 */

import { getApiBaseUrl } from '../constants/index';

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

class GeographicService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${getApiBaseUrl()}/api/v1/geographic`;
  }

  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // ============================
  // PAYS (Countries)
  // ============================
  
  async getCountries(): Promise<Country[]> {
    return this.makeRequest<Country[]>(`${this.baseURL}/countries`);
  }

  async getCountry(id: number): Promise<Country> {
    return this.makeRequest<Country>(`${this.baseURL}/countries/${id}`);
  }

  async getCountryRegions(countryId: number): Promise<Region[]> {
    return this.makeRequest<Region[]>(`${this.baseURL}/countries/${countryId}/regions`);
  }

  // ============================
  // RÉGIONS (Regions)
  // ============================
  
  async getRegions(): Promise<Region[]> {
    return this.makeRequest<Region[]>(`${this.baseURL}/regions`);
  }

  async getRegion(id: number): Promise<Region> {
    return this.makeRequest<Region>(`${this.baseURL}/regions/${id}`);
  }

  async getRegionProvinces(regionId: number): Promise<Province[]> {
    return this.makeRequest<Province[]>(`${this.baseURL}/regions/${regionId}/provinces`);
  }

  // ============================
  // PROVINCES
  // ============================
  
  async getProvinces(): Promise<Province[]> {
    return this.makeRequest<Province[]>(`${this.baseURL}/provinces`);
  }

  async getProvince(id: number): Promise<Province> {
    return this.makeRequest<Province>(`${this.baseURL}/provinces/${id}`);
  }

  async getProvinceDepartments(provinceId: number): Promise<Department[]> {
    return this.makeRequest<Department[]>(`${this.baseURL}/provinces/${provinceId}/departments`);
  }

  // ============================
  // DÉPARTEMENTS
  // ============================
  
  async getDepartments(): Promise<Department[]> {
    return this.makeRequest<Department[]>(`${this.baseURL}/departments`);
  }

  async getDepartment(id: number): Promise<Department> {
    return this.makeRequest<Department>(`${this.baseURL}/departments/${id}`);
  }

  // ============================
  // MÉTHODES UTILITAIRES
  // ============================

  /**
   * Obtient la hiérarchie complète (pays, régions, provinces) pour un pays donné
   */
  async getCountryHierarchy(countryId: number): Promise<{
    country: Country;
    regions: (Region & { provinces: Province[] })[];
  }> {
    const [country, regions] = await Promise.all([
      this.getCountry(countryId),
      this.getCountryRegions(countryId),
    ]);

    const regionsWithProvinces = await Promise.all(
      regions.map(async (region) => {
        const provinces = await this.getRegionProvinces(region.id);
        return { ...region, provinces };
      })
    );

    return {
      country,
      regions: regionsWithProvinces,
    };
  }

  /**
   * Recherche des entités géographiques par nom
   */
  async searchByName(query: string): Promise<{
    countries: Country[];
    regions: Region[];
    provinces: Province[];
    departments: Department[];
  }> {
    const [countries, regions, provinces, departments] = await Promise.all([
      this.getCountries(),
      this.getRegions(),
      this.getProvinces(),
      this.getDepartments(),
    ]);

    const searchTerm = query.toLowerCase();

    return {
      countries: countries.filter(
        (c) =>
          c.shape_name.toLowerCase().includes(searchTerm) ||
          c.shape_name_en?.toLowerCase().includes(searchTerm) ||
          c.shape_name_fr?.toLowerCase().includes(searchTerm)
      ),
      regions: regions.filter((r) =>
        r.shape_name.toLowerCase().includes(searchTerm)
      ),
      provinces: provinces.filter((p) =>
        p.shape_name.toLowerCase().includes(searchTerm)
      ),
      departments: departments.filter((d) =>
        d.shape_name.toLowerCase().includes(searchTerm)
      ),
    };
  }

  /**
   * Obtient les informations d'un pays par son code ISO
   */
  async getCountryByIso(isoCode: string): Promise<Country | null> {
    const countries = await this.getCountries();
    return (
      countries.find(
        (c) =>
          c.shape_iso?.toLowerCase() === isoCode.toLowerCase() ||
          c.shape_iso_2?.toLowerCase() === isoCode.toLowerCase()
      ) || null
    );
  }
}

export const geographicService = new GeographicService();
export default geographicService;
