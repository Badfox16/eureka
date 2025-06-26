import { Quiz } from "@/types/quiz";
import { QuizSearchParams } from "@/types/search";
import { fetchApi, buildQueryString } from "./apiService";
import { ApiResponse, ApiResponsePaginated } from "@/types/api";

// Função para listar quizzes com suporte a paginação e filtros
export async function getQuizzes(params: QuizSearchParams) {
  const queryString = buildQueryString({
    ...params,
    search: params.search,
    avaliacaoId: params.avaliacaoId,
    disciplina: params.disciplina,
    ativo: params.ativo,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder
  });  
  return fetchApi<ApiResponsePaginated<Quiz[]>>(`/quizzes${queryString}`);
}

// Função para obter um quiz específico com avaliação e questões populadas
export async function getQuiz(id: string) {  
  return fetchApi<ApiResponse<Quiz>>(`/quizzes/${id}?populate=true`);
}

// Função para criar um novo quiz
export async function createQuiz(quizData: {
  titulo: string;
  descricao?: string;
  avaliacao: string;
  tempoLimite?: number;
  ativo?: boolean;
}) {  return fetchApi<ApiResponse<Quiz>>('/quizzes', {
    method: 'POST',
    body: JSON.stringify(quizData)
  });
}

// Função para atualizar um quiz
export async function updateQuiz(id: string, quizData: Partial<{
  titulo: string;
  descricao?: string;
  avaliacao: string;
  tempoLimite?: number;
  ativo?: boolean;
}>) {  return fetchApi<ApiResponse<Quiz>>(`/quizzes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(quizData)
  });
}

// Função para excluir um quiz
export async function deleteQuiz(id: string) {  return fetchApi<ApiResponse<{ success: boolean }>>(`/quizzes/${id}`, {
    method: 'DELETE'
  });
}

// Função para alternar o status de um quiz (ativo/inativo)
export async function toggleQuizStatus(id: string) {  return fetchApi<ApiResponse<Quiz>>(`/quizzes/${id}/toggle-status`, {
    method: 'PATCH'
  });
}
