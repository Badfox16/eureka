import { apiClient } from '@/lib/api-client';
import { 
  CreateDisciplinaInput, 
  UpdateDisciplinaInput, 
  Disciplina 
} from '@/types/disciplina';
import { PaginatedResponse, QueryParams } from '@/types/api';
import { ENDPOINTS, buildQueryParams } from '@/config/api';

class DisciplinaService {
  private endpoint = ENDPOINTS.DISCIPLINAS.BASE;

  async getAll(params?: QueryParams): Promise<PaginatedResponse<Disciplina>> {
    // Usar o helper buildQueryParams do config/api
    const queryString = params ? buildQueryParams(params) : '';
    return apiClient<PaginatedResponse<Disciplina>>(
      `${this.endpoint}${queryString}`
    );
  }

  async getById(id: string): Promise<Disciplina> {
    return apiClient<Disciplina>(ENDPOINTS.DISCIPLINAS.BY_ID(id));
  }

  async create(data: CreateDisciplinaInput): Promise<Disciplina> {
    return apiClient<Disciplina>(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: string, data: UpdateDisciplinaInput): Promise<Disciplina> {
    return apiClient<Disciplina>(ENDPOINTS.DISCIPLINAS.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(id: string): Promise<void> {
    return apiClient<void>(ENDPOINTS.DISCIPLINAS.BY_ID(id), {
      method: 'DELETE',
    });
  }

  
  async search(query: string, params?: Omit<QueryParams, 'search'>): Promise<PaginatedResponse<Disciplina>> {
    return apiClient<PaginatedResponse<Disciplina>>(ENDPOINTS.DISCIPLINAS.SEARCH(query));
  }
}

export const disciplinaService = new DisciplinaService();