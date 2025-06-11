import { apiClient } from '@/lib/api-client';
import { 
  CreateProvinciaInput, 
  UpdateProvinciaInput, 
  Provincia 
} from '@/types/provincia';
import { PaginatedResponse, QueryParams } from '@/types/api';
import { ENDPOINTS, buildQueryParams } from '@/config/api';

class ProvinciaService {
  private endpoint = ENDPOINTS.PROVINCIAS.BASE;

  async getAll(params?: QueryParams): Promise<PaginatedResponse<Provincia>> {
    const queryString = params ? buildQueryParams(params) : '';
    return apiClient<PaginatedResponse<Provincia>>(
      `${this.endpoint}${queryString}`
    );
  }

  async getById(id: string): Promise<Provincia> {
    return apiClient<Provincia>(ENDPOINTS.PROVINCIAS.BY_ID(id));
  }

  async create(data: CreateProvinciaInput): Promise<Provincia> {
    return apiClient<Provincia>(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateProvinciaInput): Promise<Provincia> {
    return apiClient<Provincia>(ENDPOINTS.PROVINCIAS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    return apiClient<void>(ENDPOINTS.PROVINCIAS.BY_ID(id), {
      method: 'DELETE',
    });
  }
}

export const provinciaService = new ProvinciaService();