// src/types/auth.ts
export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  terms: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface UserProfile extends User {
  roles: Role[];
  groups: Group[];
  permissions: string[];
  preferences?: UserPreferences;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  is_system: boolean;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications_enabled: boolean;
  default_region?: string;
  favorite_datasets: string[];
  dashboard_layout?: Record<string, any>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ValidationErrors {
  [key: string]: string[];
}
