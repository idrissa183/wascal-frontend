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
    console.log(`🌐 Making request to: ${url}`);
    console.log(`🔧 Request options:`, options);
    
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const endTime = performance.now();
      console.log(`⏱️ Request to ${url} took ${Math.round(endTime - startTime)}ms`);
      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error Response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`📦 Response data:`, data);
      return data;
      
    } catch (error) {
      console.error(`❌ Request failed to ${url}:`, error);
      throw error;
    }
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
          c.shape_name_fr?.toLowerCase().includes(searchTerm) ||
          c.shape_iso?.toLowerCase().includes(searchTerm) ||
          c.shape_iso_2?.toLowerCase().includes(searchTerm)
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
   * Recherche étendue avec filtrage hiérarchique
   */
  async searchGeographic(query: string): Promise<{
    countries: Country[];
    regionsWithCountry: (Region & { country_name?: string })[];
    provincesWithHierarchy: (Province & { region_name?: string; country_name?: string })[];
    departmentsWithHierarchy: (Department & { province_name?: string; region_name?: string; country_name?: string })[];
  }> {
    if (!query || query.length < 2) {
      return {
        countries: [],
        regionsWithCountry: [],
        provincesWithHierarchy: [],
        departmentsWithHierarchy: []
      };
    }

    const searchResults = await this.searchByName(query);
    const [allCountries, allRegions, allProvinces] = await Promise.all([
      this.getCountries(),
      this.getRegions(),
      this.getProvinces(),
    ]);

    // Enrichir les régions avec le nom du pays
    const regionsWithCountry = searchResults.regions.map(region => {
      const country = allCountries.find(c => c.id === region.country_id);
      return {
        ...region,
        country_name: country?.shape_name
      };
    });

    // Enrichir les provinces avec région et pays
    const provincesWithHierarchy = searchResults.provinces.map(province => {
      const region = allRegions.find(r => r.id === province.region_id);
      const country = region ? allCountries.find(c => c.id === region.country_id) : undefined;
      return {
        ...province,
        region_name: region?.shape_name,
        country_name: country?.shape_name
      };
    });

    // Enrichir les départements avec province, région et pays
    const departmentsWithHierarchy = searchResults.departments.map(department => {
      const province = allProvinces.find(p => p.id === department.province_id);
      const region = province ? allRegions.find(r => r.id === province.region_id) : undefined;
      const country = region ? allCountries.find(c => c.id === region.country_id) : undefined;
      return {
        ...department,
        province_name: province?.shape_name,
        region_name: region?.shape_name,
        country_name: country?.shape_name
      };
    });

    return {
      countries: searchResults.countries,
      regionsWithCountry,
      provincesWithHierarchy,
      departmentsWithHierarchy
    };
  }

  /**
   * Recherche de pays avec support étendu (nom, ISO, capitale)
   */
  async searchCountries(query: string): Promise<Country[]> {
    const countries = await this.getCountries();
    
    if (!query || query.length < 2) {
      return countries;
    }
    
    const searchTerm = query.toLowerCase();
    
    return countries.filter(country => 
      country.shape_name.toLowerCase().includes(searchTerm) ||
      country.shape_name_en?.toLowerCase().includes(searchTerm) ||
      country.shape_name_fr?.toLowerCase().includes(searchTerm) ||
      country.shape_iso?.toLowerCase().includes(searchTerm) ||
      country.shape_iso_2?.toLowerCase().includes(searchTerm) ||
      country.shape_city?.toLowerCase().includes(searchTerm) // capitale
    );
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
