import { apiClient, ApiError } from '@/lib/api-client';
import { ENDPOINTS, buildQueryParams } from '@/config/api';
import { Usuario } from '@/types/usuario';
import { handleApiError } from '@/lib/error-utils';

interface UsuarioQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: string;
  status?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  status: string;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

export const usuarioService = {
  async getAll(params: UsuarioQueryParams = {}): Promise<PaginatedResponse<Usuario>> {
    try {
      const queryString = buildQueryParams(params);
      return await apiClient<PaginatedResponse<Usuario>>(`${ENDPOINTS.USERS.BASE}${queryString}`);
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async getById(id: string): Promise<Usuario> {
    try {
      const response = await apiClient<{status: string, data: Usuario}>(ENDPOINTS.USERS.BY_ID(id));
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async create(data: Omit<Usuario, '_id' | 'createdAt' | 'updatedAt'>): Promise<Usuario> {
    try {
      const response = await apiClient<{status: string, data: Usuario}>(ENDPOINTS.USERS.BASE, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Omit<Usuario, '_id' | 'createdAt' | 'updatedAt'>>): Promise<Usuario> {
    try {
      const response = await apiClient<{status: string, data: Usuario}>(ENDPOINTS.USERS.BY_ID(id), {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient(ENDPOINTS.USERS.BY_ID(id), {
        method: 'DELETE'
      });
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async search(query: string): Promise<Usuario[]> {
    try {
      const response = await apiClient<{status: string, data: Usuario[]}>(ENDPOINTS.USERS.SEARCH(query));
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};