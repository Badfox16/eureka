import { apiClient } from '@/lib/api-client';
import { ENDPOINTS, buildQueryParams } from '@/config/api';
import { Avaliacao, CreateAvaliacaoInput, UpdateAvaliacaoInput } from '@/types/avaliacao';

interface ApiResponse<T> {
  status: string;
  data: T;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

// Interface para parâmetros de consulta
interface QueryParams {
  page?: number;
  limit?: number;
  tipo?: string;
  disciplina?: string;
  ano?: number;
  classe?: number;
  trimestre?: string;
  provincia?: string;
  epoca?: string;
  variante?: string;
  areaEstudo?: string;
  search?: string;
}

class AvaliacaoService {
  /**
   * Obter todas as avaliações com paginação e filtros
   */
  async getAll(params?: QueryParams): Promise<ApiResponse<Avaliacao[]>> {
    const queryString = buildQueryParams(params || {});
    return apiClient<ApiResponse<Avaliacao[]>>(`${ENDPOINTS.AVALIACOES.BASE}${queryString}`);
  }

  /**
   * Obter uma avaliação por ID
   */
  async getById(id: string): Promise<ApiResponse<Avaliacao>> {
    return apiClient<ApiResponse<Avaliacao>>(ENDPOINTS.AVALIACOES.BY_ID(id));
  }

  /**
   * Criar uma nova avaliação
   */
  async create(data: CreateAvaliacaoInput): Promise<Avaliacao> {
    return apiClient<Avaliacao>(ENDPOINTS.AVALIACOES.BASE, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Atualizar uma avaliação existente
   */
  async update(id: string, data: UpdateAvaliacaoInput): Promise<Avaliacao> {
    return apiClient<Avaliacao>(ENDPOINTS.AVALIACOES.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Excluir uma avaliação
   */
  async delete(id: string): Promise<void> {
    return apiClient<void>(ENDPOINTS.AVALIACOES.BY_ID(id), {
      method: 'DELETE'
    });
  }

  /**
   * Buscar avaliações por termo
   */
  async search(query: string): Promise<Avaliacao[]> {
    return apiClient<Avaliacao[]>(ENDPOINTS.AVALIACOES.SEARCH(query));
  }
}

export const avaliacaoService = new AvaliacaoService();