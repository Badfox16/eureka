import { apiClient } from '@/lib/api-client';
import { Usuario, CreateUsuarioInput, UpdateUsuarioInput } from '@/types/usuario';
import { handleApiError } from '@/lib/error-utils';

interface UsuarioQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: string;
  status?: string;
}

// Formato de resposta padronizado para o frontend
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

// Construtor de query string
const buildQueryString = (params: Record<string, any>): string => {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return query ? `?${query}` : '';
};

export const usuarioService = {
  async getAll(params: UsuarioQueryParams = {}): Promise<PaginatedResponse<Usuario>> {
    try {
      const queryString = buildQueryString(params);
      const response = await apiClient<{
        status: string;
        data: Usuario[];
        meta: {
          total: number;
          page: number;
          limit: number;
          pages: number;
        }
      }>(`/usuarios${queryString}`);
      
      return {
        data: response.data,
        pagination: {
          total: response.meta.total,
          page: response.meta.page,
          limit: response.meta.limit,
          totalPages: response.meta.pages
        }
      };
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async getById(id: string): Promise<Usuario> {
    try {
      const response = await apiClient<{
        status: string;
        data: Usuario;
      }>(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async create(data: CreateUsuarioInput): Promise<Usuario> {
    try {
      const response = await apiClient<{
        status: string;
        data: Usuario;
      }>(`/usuarios`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async update(id: string, data: UpdateUsuarioInput): Promise<Usuario> {
    try {
      const response = await apiClient<{
        status: string;
        data: Usuario;
      }>(`/usuarios/${id}`, {
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
      await apiClient(`/usuarios/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  async search(query: string): Promise<Usuario[]> {
    try {
      const response = await apiClient<{
        status: string;
        data: Usuario[];
      }>(`/usuarios/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};