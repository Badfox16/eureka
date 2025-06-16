import { apiClient } from '@/lib/api-client';
import { ENDPOINTS, buildQueryParams } from '@/config/api';
import { Questao, CreateQuestaoInput, UpdateQuestaoInput } from '@/types/questao';
import { PaginatedResponse } from '@/types/api';

// Interface para parâmetros de consulta
interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  disciplina?: string;
  avaliacaoId?: string;
  notInAvaliacao?: string;
}

class QuestaoService {
  /**
   * Obter todas as questões com paginação e filtros
   */
  async getAll(params?: QueryParams): Promise<PaginatedResponse<Questao>> {
    const queryString = buildQueryParams(params || {});
    return apiClient<PaginatedResponse<Questao>>(`${ENDPOINTS.QUESTOES.BASE}${queryString}`);
  }

  /**
   * Obter uma questão por ID
   */
  async getById(id: string): Promise<Questao> {
    return apiClient<Questao>(ENDPOINTS.QUESTOES.BY_ID(id));
  }

  /**
   * Criar uma nova questão
   */
  async create(data: CreateQuestaoInput): Promise<Questao> {
    return apiClient<Questao>(ENDPOINTS.QUESTOES.BASE, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Atualizar uma questão existente
   */
  async update(id: string, data: UpdateQuestaoInput): Promise<Questao> {
    return apiClient<Questao>(ENDPOINTS.QUESTOES.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Excluir uma questão
   */
  async delete(id: string): Promise<void> {
    return apiClient<void>(ENDPOINTS.QUESTOES.BY_ID(id), {
      method: 'DELETE'
    });
  }

  /**
   * Adicionar uma questão a uma avaliação
   */
  async addToAvaliacao(avaliacaoId: string, questaoId: string): Promise<any> {
    return apiClient<any>(`${ENDPOINTS.AVALIACOES.BY_ID(avaliacaoId)}/questoes/${questaoId}`, {
      method: 'POST'
    });
  }

  /**
   * Remover uma questão de uma avaliação
   */
  async removeFromAvaliacao(avaliacaoId: string, questaoId: string): Promise<any> {
    return apiClient<any>(`${ENDPOINTS.AVALIACOES.BY_ID(avaliacaoId)}/questoes/${questaoId}`, {
      method: 'DELETE'
    });
  }
}

export const questaoService = new QuestaoService();