import { apiClient } from '@/lib/api-client';
import { Usuario, CreateUsuarioInput, UpdateUsuarioInput } from '@/types/usuario';
import { PaginatedResponse, QueryParams, ApiResponse } from '@/types/api';
import { ENDPOINTS, buildQueryParams } from '@/config/api';

class UsuarioService {
  private endpoint = ENDPOINTS.USERS.BASE;

  async getAll(params?: QueryParams): Promise<PaginatedResponse<Usuario>> {
    const queryString = params ? buildQueryParams(params) : '';
    return apiClient<PaginatedResponse<Usuario>>(
      `${this.endpoint}${queryString}`
    );
  }

  async getById(id: string): Promise<ApiResponse<Usuario>> {
    return apiClient<ApiResponse<Usuario>>(ENDPOINTS.USERS.BY_ID(id));
  }

  async create(data: CreateUsuarioInput): Promise<ApiResponse<Usuario>> {
    return apiClient<ApiResponse<Usuario>>(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateUsuarioInput): Promise<ApiResponse<Usuario>> {
    return apiClient<ApiResponse<Usuario>>(ENDPOINTS.USERS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient<ApiResponse<null>>(ENDPOINTS.USERS.BY_ID(id), {
      method: 'DELETE',
    });
  }

  async search(query: string, params?: Omit<QueryParams, 'search'>): Promise<PaginatedResponse<Usuario>> {
    return apiClient<PaginatedResponse<Usuario>>(ENDPOINTS.USERS.SEARCH(query));
  }
}

export const usuarioService = new UsuarioService();