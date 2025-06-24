import { apiClient } from '@/lib/api-client';
import { ENDPOINTS, buildQueryParams } from '@/config/api';
import {
  Questao,
  CreateQuestaoInput,
  UpdateQuestaoInput,
  QuestaoQueryParams
} from '@/types/questao';
import { ApiResponse, PaginatedResponse } from '@/types/api';

class QuestaoService {
  /**
   * Obter todas as questões com paginação e filtros
   */
  async getAll(params?: QuestaoQueryParams): Promise<PaginatedResponse<Questao>> {
    // Converter avaliacaoId para avaliacao se presente (formato esperado pela API)
    const apiParams: Record<string, any> = { ...params };

    if (params?.avaliacaoId) {
      apiParams.avaliacao = params.avaliacaoId;
      delete apiParams.avaliacaoId;
    }

    const queryString = buildQueryParams(apiParams || {});
    return apiClient<PaginatedResponse<Questao>>(`${ENDPOINTS.QUESTOES.BASE}${queryString}`);
  }

  /**
   * Obter uma questão por ID
   */
  async getById(id: string): Promise<ApiResponse<Questao>> {
    return apiClient<ApiResponse<Questao>>(ENDPOINTS.QUESTOES.BY_ID(id));
  }

  /**
   * Criar uma nova questão
   */
  async create(data: CreateQuestaoInput): Promise<ApiResponse<Questao>> {
    return apiClient<ApiResponse<Questao>>(ENDPOINTS.QUESTOES.BASE, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Atualizar uma questão existente
   */
  async update(id: string, data: UpdateQuestaoInput): Promise<ApiResponse<Questao>> {
    return apiClient<ApiResponse<Questao>>(ENDPOINTS.QUESTOES.BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Excluir uma questão
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient<ApiResponse<null>>(ENDPOINTS.QUESTOES.BY_ID(id), {
      method: 'DELETE'
    });
  }

  /**
   * Adicionar uma questão a uma avaliação
   */
  async addToAvaliacao(avaliacaoId: string, questaoId: string): Promise<ApiResponse<any>> {
    return apiClient<ApiResponse<any>>(`${ENDPOINTS.AVALIACOES.BY_ID(avaliacaoId)}/questoes/${questaoId}`, {
      method: 'POST'
    });
  }

  /**
   * Remover uma questão de uma avaliação
   */
  async removeFromAvaliacao(avaliacaoId: string, questaoId: string): Promise<ApiResponse<any>> {
    return apiClient<ApiResponse<any>>(`${ENDPOINTS.AVALIACOES.BY_ID(avaliacaoId)}/questoes/${questaoId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Fazer upload de imagem para o enunciado da questão
   */
  async uploadImagemEnunciado(id: string, file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    // Usar o nome correto do campo esperado pelo backend
    formData.append('imagemEnunciado', file);

    return apiClient<ApiResponse<{ imageUrl: string }>>(`${ENDPOINTS.QUESTOES.BY_ID(id)}/imagem-enunciado`, {
      method: 'POST',
      body: formData,
      headers: {} // Remover o Content-Type para que o navegador defina o boundary correto
    });
  }

  /**
   * Fazer upload de imagem para uma alternativa específica
   */
  async uploadImagemAlternativa(id: string, letra: string, file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    // Usar o nome correto do campo esperado pelo backend
    formData.append('imagemAlternativa', file);

    return apiClient<ApiResponse<{ imageUrl: string }>>(`${ENDPOINTS.QUESTOES.BY_ID(id)}/alternativas/${letra}/imagem`, {
      method: 'POST',
      body: formData,
      headers: {} // Remover o Content-Type para que o navegador defina o boundary correto
    });
  }

  /**
   * Fazer upload temporário de uma imagem
   * Usado principalmente durante a criação de novas questões
   */
  async uploadTempImage(file: File): Promise<ApiResponse<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('imagem', file);

    return apiClient<ApiResponse<{ imageUrl: string }>>(ENDPOINTS.UPLOADS.TEMP, {
      method: 'POST',
      body: formData,
      headers: {} // Remover o Content-Type para que o navegador defina o boundary correto
    });
  }

  /**
   * Associar uma imagem temporária existente ao enunciado de uma questão
   */
  async associarImagemTemporaria(
    questaoId: string,
    imagemTemporariaUrl: string,
    tipo: 'enunciado' | 'alternativa',
    letra?: string
  ): Promise<ApiResponse<{ imageUrl: string }>> {
    // Determinar o endpoint com base no tipo
    const endpoint = tipo === 'enunciado'
      ? ENDPOINTS.QUESTOES.UPLOAD_ENUNCIADO_IMAGE(questaoId)
      : ENDPOINTS.QUESTOES.UPLOAD_ALTERNATIVA_IMAGE(questaoId, letra || '');

    // Enviar a URL da imagem temporária
    return apiClient<ApiResponse<{ imageUrl: string }>>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ imagemTemporariaUrl })
    });
  }
}

export const questaoService = new QuestaoService();