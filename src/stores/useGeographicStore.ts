import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { geographicService, type Country, type Region, type Province, type Department } from '../services/geographic.service';

export interface GeographicSelection {
  id: string;
  type: 'country' | 'region' | 'province' | 'department';
  name: string;
  geometry?: any; // GeoJSON geometry
  isLoading?: boolean;
  error?: string;
}

export interface GeographicState {
  // Selected geographic entities
  selectedEntities: GeographicSelection[];
  
  // Loading states
  isLoadingGeometry: boolean;
  
  // Actions
  addSelection: (entity: GeographicSelection) => Promise<void>;
  removeSelection: (id: string, type: string) => void;
  clearSelections: () => void;
  loadGeometry: (entity: GeographicSelection) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useGeographicStore = create<GeographicState>()(
  persist(
    (set, get) => ({
      selectedEntities: [],
      isLoadingGeometry: false,

      addSelection: async (entity: GeographicSelection) => {
        console.log(`🎯 addSelection called for ${entity.type} ${entity.id}`);
        
        const currentState = get();
        
        // Check if already selected
        const exists = currentState.selectedEntities.find(
          (e) => e.id === entity.id && e.type === entity.type
        );
        
        if (exists) {
          console.log(`ℹ️ Entity ${entity.type} ${entity.id} already selected, skipping`);
          return;
        }

        const newEntity = { ...entity, isLoading: true };
        console.log(`✅ Adding entity to store:`, newEntity);
        
        // Add entity to store with loading state
        set((state) => ({
          selectedEntities: [...state.selectedEntities, newEntity],
        }));
        
        // Load geometry asynchronously - but don't await to avoid blocking UI
        console.log(`🚀 Starting loadGeometry for ${entity.type} ${entity.id}`);
        currentState.loadGeometry(newEntity).catch((error) => {
          console.error(`❌ Failed to load geometry in addSelection:`, error);
        });
      },

      removeSelection: (id: string, type: string) => {
        set((state) => ({
          selectedEntities: state.selectedEntities.filter(
            (entity) => !(entity.id === id && entity.type === type)
          ),
        }));
      },

      clearSelections: () => {
        set({ selectedEntities: [] });
      },

      setLoading: (loading: boolean) => {
        set({ isLoadingGeometry: loading });
      },

      loadGeometry: async (entity: GeographicSelection) => {
        console.log(`🚀 STARTING loadGeometry for ${entity.type} ${entity.id}`);
        try {
          set({ isLoadingGeometry: true });
          
          console.log(`🔄 Loading geometry for ${entity.type} ${entity.id}...`);
          // Check service state
          console.log(`🔧 Geographic service:`, geographicService);
          console.log(`🌐 API base URL: ${(geographicService as any).baseURL || 'undefined'}`);
          
          // Add network connectivity test
          try {
            const testResponse = await fetch((geographicService as any).baseURL?.replace('/api/v1/geographic', '') + '/health');
            console.log(`🏥 Health check status: ${testResponse.status}`);
          } catch (healthError) {
            console.warn(`⚠️ Health check failed:`, healthError);
          }
          
          let geometryData;
          const startTime = performance.now();
          
          switch (entity.type) {
            case 'country':
              console.log(`📡 Calling API: getCountry(${entity.id})`);
              console.log(`📍 Full URL would be: /api/v1/geographic/countries/${entity.id}`);
              geometryData = await geographicService.getCountry(parseInt(entity.id));
              break;
            case 'region':
              console.log(`📡 Calling API: getRegion(${entity.id})`);
              console.log(`📍 Full URL would be: /api/v1/geographic/regions/${entity.id}`);
              geometryData = await geographicService.getRegion(parseInt(entity.id));
              break;
            case 'province':
              console.log(`📡 Calling API: getProvince(${entity.id})`);
              console.log(`📍 Full URL would be: /api/v1/geographic/provinces/${entity.id}`);
              geometryData = await geographicService.getProvince(parseInt(entity.id));
              break;
            case 'department':
              console.log(`📡 Calling API: getDepartment(${entity.id})`);
              console.log(`📍 Full URL would be: /api/v1/geographic/departments/${entity.id}`);
              geometryData = await geographicService.getDepartment(parseInt(entity.id));
              break;
            default:
              throw new Error(`Unknown entity type: ${entity.type}`);
          }

          const endTime = performance.now();
          console.log(`⏱️ API call took ${Math.round(endTime - startTime)}ms`);
          console.log(`📦 Full response for ${entity.type} ${entity.id}:`, geometryData);
          console.log(`🗺️ Geometry data:`, geometryData.geometry);
          console.log(`🔍 Geometry type:`, geometryData.geometry?.type);
          console.log(`📏 Geometry coordinates length:`, geometryData.geometry?.coordinates?.length);

          // Check if geometry exists
          if (!geometryData.geometry) {
            console.warn(`⚠️ No geometry data in response for ${entity.type} ${entity.name}`);
            throw new Error(`No geometry data available for ${entity.type} ${entity.name}`);
          }

          // Validate geometry structure
          if (!geometryData.geometry.type || !geometryData.geometry.coordinates) {
            console.warn(`⚠️ Invalid geometry structure for ${entity.type} ${entity.name}:`, geometryData.geometry);
            throw new Error(`Invalid geometry structure for ${entity.type} ${entity.name}`);
          }

          console.log(`✅ Successfully loaded geometry for ${entity.type} ${entity.id}`);
          console.log(`🎯 About to update entity state in store`);

          // Update entity with loaded geometry
          set((state) => ({
            selectedEntities: state.selectedEntities.map((e) =>
              e.id === entity.id && e.type === entity.type
                ? {
                    ...e,
                    geometry: geometryData.geometry,
                    isLoading: false,
                    error: undefined,
                  }
                : e
            ),
          }));
          
          console.log(`🏁 FINISHED loadGeometry for ${entity.type} ${entity.id} - SUCCESS`);
        } catch (error) {
          console.error(`❌ Error loading geometry for ${entity.type} ${entity.id}:`, error);
          console.error(`📍 Error details:`, {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            entity: entity
          });
          
          // Update entity with error
          set((state) => ({
            selectedEntities: state.selectedEntities.map((e) =>
              e.id === entity.id && e.type === entity.type
                ? {
                    ...e,
                    isLoading: false,
                    error: error instanceof Error ? error.message : 'Failed to load geometry',
                  }
                : e
            ),
          }));
          console.log(`🏁 FINISHED loadGeometry for ${entity.type} ${entity.id} - ERROR`);
        } finally {
          set({ isLoadingGeometry: false });
          console.log(`🔚 CLEANUP: Set isLoadingGeometry to false for ${entity.type} ${entity.id}`);
        }
      },
    }),
    {
      name: 'geographic-store',
      // Only persist selections, not loading states
      partialize: (state) => ({
        selectedEntities: state.selectedEntities.map(entity => ({
          ...entity,
          isLoading: false,
          error: undefined,
        })),
      }),
    }
  )
);