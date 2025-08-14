import { getApiBaseUrl } from '../constants';

export interface UserField {
  id: number;
  name: string;
  user_id: number;
  geometry_type: 'point' | 'polygon' | 'circle' | 'rectangle';
  geometry: any;
  area_km2?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateUserFieldRequest {
  name: string;
  geometry_type: 'point' | 'polygon' | 'circle' | 'rectangle';
  geometry: any;
}

export interface UpdateUserFieldRequest {
  name?: string;
  geometry_type?: 'point' | 'polygon' | 'circle' | 'rectangle';
  geometry?: any;
}

class UserFieldsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${getApiBaseUrl()}/api/v1/geographic`;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async createUserField(data: CreateUserFieldRequest): Promise<UserField> {
    const response = await fetch(`${this.baseUrl}/user-fields`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user field: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserFields(skip: number = 0, limit: number = 100): Promise<UserField[]> {
    const response = await fetch(`${this.baseUrl}/user-fields?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user fields: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserField(id: number): Promise<UserField> {
    const response = await fetch(`${this.baseUrl}/user-fields/${id}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user field: ${response.statusText}`);
    }

    return response.json();
  }

  async updateUserField(id: number, data: UpdateUserFieldRequest): Promise<UserField> {
    const response = await fetch(`${this.baseUrl}/user-fields/${id}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user field: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteUserField(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/user-fields/${id}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user field: ${response.statusText}`);
    }
  }
}

export const userFieldsService = new UserFieldsService();