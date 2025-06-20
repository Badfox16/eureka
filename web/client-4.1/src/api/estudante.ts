import { ApiResponse, PaginatedResponse } from "@/types/api";
import { Estudante } from "@/types/estudante";
import { EstudanteQuiz } from "@/types/estudanteQuiz";
import { EstatisticaDisciplina, EvolucaoDesempenho, EstatisticasEstudante } from "@/types/estatisticas";
import { EstudanteSearchParams } from "@/types/search";
import { fetchApi, buildQueryString } from "./apiService";

// Função para listar estudantes com suporte a paginação e filtros
export async function getEstudantes(params: EstudanteSearchParams): Promise<PaginatedResponse<Estudante>> {
  const queryString = buildQueryString(params);
  return fetchApi<PaginatedResponse<Estudante>>(`/estudantes${queryString}`);
}

// Função para obter um estudante específico
export async function getEstudante(id: string): Promise<ApiResponse<Estudante>> {
  return fetchApi<ApiResponse<Estudante>>(`/estudantes/${id}`);
}

// Função para obter o perfil do estudante atual
export async function getPerfilEstudante(): Promise<ApiResponse<Estudante | null>> {
  try {
    // Primeiro obtém os dados de usuário básicos
    const respUsuario = await fetchApi<{ status: string, data: { usuario: any, estudante: Estudante | null } }>(`/auth/me`);
    
    console.log("Resposta do /auth/me:", respUsuario);
    
    // Se não há estudante associado, retorna null
    if (!respUsuario.data || !respUsuario.data.estudante) {
      console.warn('Usuário não tem perfil de estudante associado');
      return {
        data: null
      };
    }
    
    // Retorna apenas o estudante
    return {
      data: respUsuario.data.estudante
    };
  } catch (error) {
    console.error('Erro ao obter perfil do estudante:', error);
    throw error;
  }
}

// Função para obter quizzes realizados por um estudante
export async function getQuizzesEstudante(
  id: string, 
  params?: { page: number; limit: number }
): Promise<PaginatedResponse<EstudanteQuiz>> {
  const queryString = params ? buildQueryString(params) : '';
  return fetchApi<PaginatedResponse<EstudanteQuiz>>(`/estudantes/${id}/quizzes${queryString}`);
}

// Função para obter estatísticas de um estudante
export async function getEstatisticasEstudante(id: string): Promise<ApiResponse<EstatisticasEstudante>> {
  return fetchApi<ApiResponse<EstatisticasEstudante>>(`/estatisticas/estudantes/${id}/estatisticas`);
}

// Função para obter estatísticas por disciplina
export async function getEstatisticasPorDisciplina(id: string): Promise<ApiResponse<EstatisticaDisciplina[]>> {
  return fetchApi<ApiResponse<EstatisticaDisciplina[]>>(`/estudantes/${id}/estatisticas/disciplinas`);
}

// Função para obter evolução de desempenho
export async function getEvolucaoDesempenho(id: string): Promise<ApiResponse<EvolucaoDesempenho>> {
  return fetchApi<ApiResponse<EvolucaoDesempenho>>(`/estudantes/${id}/estatisticas/evolucao`);
}

// Função para atualizar senha do estudante
export async function atualizarSenhaEstudante(
  senhaAtual: string, 
  novaSenha: string
): Promise<ApiResponse<{ sucesso: boolean }>> {
  return fetchApi<ApiResponse<{ sucesso: boolean }>>(`/estudantes/me/alterar-senha`, {
    method: 'POST',
    body: JSON.stringify({ senhaAtual, novaSenha }),
  });
}

export type UpdateEstudanteInput = {
  nome?: string;
  email?: string;
  classe?: number;
  escola?: string;
  provincia?: string;
};

// Função para atualizar perfil do estudante
export async function updateEstudante(
  id: string, 
  dados: UpdateEstudanteInput
): Promise<ApiResponse<Estudante>> {
  return fetchApi<ApiResponse<Estudante>>(`/estudantes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

// Função para atualizar perfil do estudante atual
export async function updatePerfilEstudante(
  dados: UpdateEstudanteInput
): Promise<ApiResponse<Estudante>> {
  return fetchApi<ApiResponse<Estudante>>(`/estudantes/me`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}
