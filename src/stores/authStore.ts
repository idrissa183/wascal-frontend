// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import axios from "axios";
// import { API_BASE_URL } from "../constants";

// interface User {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   role: "admin" | "user";
// }

// interface AuthState {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   register: (data: RegisterData) => Promise<void>;
//   logout: () => void;
//   clearError: () => void;
// }

// interface RegisterData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
// }

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       user: null,
//       token: null,
//       isAuthenticated: false,
//       isLoading: false,
//       error: null,

//       login: async (email: string, password: string) => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await axios.post(`${API_BASE_URL}/auth/login`, {
//             email,
//             password,
//           });
//           const { user, token } = response.data;
//           set({
//             user,
//             token,
//             isAuthenticated: true,
//             isLoading: false,
//           });
//           // Set axios default header
//           axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//         } catch (error: any) {
//           set({
//             error: error.response?.data?.message || "Login failed",
//             isLoading: false,
//           });
//         }
//       },

//       register: async (data: RegisterData) => {
//         set({ isLoading: true, error: null });
//         try {
//           const response = await axios.post(
//             `${API_BASE_URL}/auth/register`,
//             data
//           );
//           const { user, token } = response.data;
//           set({
//             user,
//             token,
//             isAuthenticated: true,
//             isLoading: false,
//           });
//           // Set axios default header
//           axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//         } catch (error: any) {
//           set({
//             error: error.response?.data?.message || "Registration failed",
//             isLoading: false,
//           });
//         }
//       },

//       logout: () => {
//         set({
//           user: null,
//           token: null,
//           isAuthenticated: false,
//           error: null,
//         });
//         delete axios.defaults.headers.common["Authorization"];
//       },

//       clearError: () => set({ error: null }),
//     }),
//     {
//       name: "auth-storage",
//       partialize: (state) => ({
//         user: state.user,
//         token: state.token,
//         isAuthenticated: state.isAuthenticated,
//       }),
//     }
//   )
// );
