import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userFieldsService, type UserField, type CreateUserFieldRequest, type UpdateUserFieldRequest } from '../services/userFields.service';

interface UserFieldsState {
  userFields: UserField[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchUserFields: () => Promise<void>;
  createUserField: (data: CreateUserFieldRequest) => Promise<UserField>;
  updateUserField: (id: number, data: UpdateUserFieldRequest) => Promise<UserField>;
  deleteUserField: (id: number) => Promise<void>;
  getUserField: (id: number) => UserField | undefined;
  clearError: () => void;
  
  // UI state for drawing
  isDrawing: boolean;
  drawingType: 'point' | 'polygon' | 'circle' | 'rectangle' | null;
  currentDrawnGeometry: any;
  setDrawing: (isDrawing: boolean, type?: 'point' | 'polygon' | 'circle' | 'rectangle' | null) => void;
  setCurrentDrawnGeometry: (geometry: any) => void;
  clearCurrentDrawing: () => void;
}

export const useUserFieldsStore = create<UserFieldsState>()(
  persist(
    (set, get) => ({
      userFields: [],
      loading: false,
      error: null,
      isDrawing: false,
      drawingType: null,
      currentDrawnGeometry: null,

      fetchUserFields: async () => {
        set({ loading: true, error: null });
        try {
          const userFields = await userFieldsService.getUserFields();
          set({ userFields, loading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch user fields',
            loading: false 
          });
        }
      },

      createUserField: async (data: CreateUserFieldRequest) => {
        set({ loading: true, error: null });
        try {
          const newField = await userFieldsService.createUserField(data);
          set((state) => ({
            userFields: [...state.userFields, newField],
            loading: false
          }));
          return newField;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create user field';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      updateUserField: async (id: number, data: UpdateUserFieldRequest) => {
        set({ loading: true, error: null });
        try {
          const updatedField = await userFieldsService.updateUserField(id, data);
          set((state) => ({
            userFields: state.userFields.map(field => 
              field.id === id ? updatedField : field
            ),
            loading: false
          }));
          return updatedField;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update user field';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      deleteUserField: async (id: number) => {
        set({ loading: true, error: null });
        try {
          await userFieldsService.deleteUserField(id);
          set((state) => ({
            userFields: state.userFields.filter(field => field.id !== id),
            loading: false
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete user field';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      getUserField: (id: number) => {
        return get().userFields.find(field => field.id === id);
      },

      clearError: () => set({ error: null }),

      setDrawing: (isDrawing: boolean, type = null) => {
        set({ isDrawing, drawingType: type });
      },

      setCurrentDrawnGeometry: (geometry: any) => {
        set({ currentDrawnGeometry: geometry });
      },

      clearCurrentDrawing: () => {
        set({ 
          isDrawing: false, 
          drawingType: null, 
          currentDrawnGeometry: null 
        });
      },
    }),
    {
      name: 'user-fields-store',
      partialize: (state) => ({ userFields: state.userFields }),
    }
  )
);