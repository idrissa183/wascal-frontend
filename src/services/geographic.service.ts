/**
 * Service pour l'interaction avec l'API géographique
 */

import { getApiBaseUrl } from '../constants/index';
import { authService } from './auth.service';

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
  private searchCache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 60000; // Cache pendant 1 minute

  constructor() {
    this.baseURL = `${getApiBaseUrl()}/api/v1/geographic`;
  }

  private async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    console.log(`🌐 Making request to: ${url}`);
    console.log(`🔧 Request options:`, options);
    
    const startTime = performance.now();
    
    try {
      // Obtenir les headers d'authentification
      const authHeaders = authService.getAuthHeaders();
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
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
   * Recherche rapide utilisant les endpoints existants avec cache
   */
  async searchGeographic(query: string): Promise<{
    countries: (Country & { country_name?: string })[];
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

    // Vérifier le cache
    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = this.searchCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < this.cacheTimeout)) {
      console.log(`🎯 Cache hit for query: ${query}`);
      return cached.data;
    }

    try {
      // Utiliser les endpoints existants avec recherche côté client comme fallback
      const searchParams = new URLSearchParams({
        limit: '50' // Augmenter la limite pour compenser le filtrage côté client
      });

      // Charger toutes les données en parallèle puis filtrer côté client
      const [allCountries, allRegions, allProvinces, allDepartments] = await Promise.all([
        this.makeRequest<Country[]>(`${this.baseURL}/countries?${searchParams}`),
        this.makeRequest<Region[]>(`${this.baseURL}/regions?${searchParams}`),
        this.makeRequest<Province[]>(`${this.baseURL}/provinces?${searchParams}`),
        this.makeRequest<Department[]>(`${this.baseURL}/departments?${searchParams}`)
      ]);

      const searchTerm = query.toLowerCase();

      // Filtrer côté client avec recherche étendue
      const countries = allCountries.filter(country => 
        country.shape_name?.toLowerCase().includes(searchTerm) ||
        country.shape_name_en?.toLowerCase().includes(searchTerm) ||
        country.shape_name_fr?.toLowerCase().includes(searchTerm) ||
        country.shape_iso?.toLowerCase().includes(searchTerm) ||
        country.shape_iso_2?.toLowerCase().includes(searchTerm) ||
        country.shape_city?.toLowerCase().includes(searchTerm)
      );

      const regions = allRegions.filter(region =>
        region.shape_name?.toLowerCase().includes(searchTerm)
      );

      const provinces = allProvinces.filter(province =>
        province.shape_name?.toLowerCase().includes(searchTerm)
      );

      const departments = allDepartments.filter(department =>
        department.shape_name?.toLowerCase().includes(searchTerm)
      );

      // Créer des mappings pour enrichir les données hiérarchiques
      const countryMap = new Map(allCountries.map(c => [c.id, c.shape_name]));
      const regionMap = new Map(allRegions.map(r => [r.id, { name: r.shape_name, country_id: r.country_id }]));
      const provinceMap = new Map(allProvinces.map(p => [p.id, { name: p.shape_name, region_id: p.region_id }]));

      // Enrichir les régions avec le nom du pays
      const regionsWithCountry = regions.map(region => ({
        ...region,
        country_name: countryMap.get(region.country_id) || 'Unknown Country'
      }));

      // Enrichir les provinces avec région et pays
      const provincesWithHierarchy = provinces.map(province => {
        const regionInfo = regionMap.get(province.region_id);
        const countryName = regionInfo ? countryMap.get(regionInfo.country_id) : undefined;
        return {
          ...province,
          region_name: regionInfo?.name || 'Unknown Region',
          country_name: countryName || 'Unknown Country'
        };
      });

      // Enrichir les départements avec province, région et pays
      const departmentsWithHierarchy = departments.map(department => {
        const provinceInfo = provinceMap.get(department.province_id);
        const regionInfo = provinceInfo ? regionMap.get(provinceInfo.region_id) : undefined;
        const countryName = regionInfo ? countryMap.get(regionInfo.country_id) : undefined;
        return {
          ...department,
          province_name: provinceInfo?.name || 'Unknown Province',
          region_name: regionInfo?.name || 'Unknown Region',
          country_name: countryName || 'Unknown Country'
        };
      });

      const result = {
        countries: countries.map(c => ({ ...c, country_name: c.shape_name })),
        regionsWithCountry,
        provincesWithHierarchy,
        departmentsWithHierarchy
      };

      // Mettre en cache le résultat
      this.searchCache.set(cacheKey, {
        data: result,
        timestamp: now
      });

      // Nettoyer le cache (garder seulement les 10 dernières recherches)
      if (this.searchCache.size > 10) {
        const oldestKey = this.searchCache.keys().next().value;
        if (oldestKey) {
          this.searchCache.delete(oldestKey);
        }
      }

      console.log(`💾 Cached search result for query: ${query}`);
      return result;

    } catch (error) {
      console.error('❌ Search error:', error);
      // Retourner des résultats vides en cas d'erreur
      return {
        countries: [],
        regionsWithCountry: [],
        provincesWithHierarchy: [],
        departmentsWithHierarchy: []
      };
    }
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
