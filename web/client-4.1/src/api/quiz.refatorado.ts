import { Quiz } from "@/types/quiz";
import { QuizSearchParams } from "@/types/search";
import { fetchApi, buildQueryString, createAuthHeaders } from "./apiService";

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
  
  return fetchApi<Quiz[]>(`/quizzes${queryString}`, {
    headers: createAuthHeaders(),
  });
}

// Função para obter um quiz específico
export async function getQuiz(id: string) {
  return fetchApi<Quiz>(`/quizzes/${id}`, {
    headers: createAuthHeaders(),
  });
}

// Função para criar um novo quiz
export async function createQuiz(quizData: {
  titulo: string;
  descricao?: string;
  avaliacao: string;
  tempoLimite?: number;
  ativo?: boolean;
}) {
  return fetchApi<Quiz>('/quizzes', {
    method: 'POST',
    body: JSON.stringify(quizData),
    headers: createAuthHeaders(),
  });
}

// Função para atualizar um quiz
export async function updateQuiz(id: string, quizData: Partial<{
  titulo: string;
  descricao?: string;
  avaliacao: string;
  tempoLimite?: number;
  ativo?: boolean;
}>) {
  return fetchApi<Quiz>(`/quizzes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(quizData),
    headers: createAuthHeaders(),
  });
}

// Função para excluir um quiz
export async function deleteQuiz(id: string) {
  return fetchApi<{ success: boolean }>(`/quizzes/${id}`, {
    method: 'DELETE',
    headers: createAuthHeaders(),
  });
}

// Função para alternar o status de um quiz (ativo/inativo)
export async function toggleQuizStatus(id: string) {
  return fetchApi<Quiz>(`/quizzes/${id}/toggle-status`, {
    method: 'PATCH',
    headers: createAuthHeaders(),
  });
}
