import { PaginationData } from "../types/api";
import { AttemptSearchParams } from "../types/search";
import { ErrorResponse } from "../types/error";
import { QuizAttempt, QuizAnswer } from "../types/attempt";

// URL base da API (pode ser configurada em um arquivo .env)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eureka.edu.br';

// Opções padrão para requisições fetch
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Função auxiliar para requisições fetch com tratamento de erros
async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<{
  data?: T;
  error?: ErrorResponse;
  pagination?: PaginationData;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });
    
    const responseData = await res.json();
    
    // Tratando erros conforme o formato da API
    if (!res.ok) {
      return {
        error: {
          code: res.status.toString(),
          message: responseData.message || 'Ocorreu um erro na requisição',
          details: responseData.details || undefined,
        },
      };
    }
    
    return {
      data: responseData.data,
      pagination: responseData.pagination,
      message: responseData.message
    };
  } catch (error) {
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error 
          ? error.message 
          : 'Ocorreu um erro na conexão com o servidor',
      },
    };
  }
}

// Função para obter o token de autenticação do storage
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

// Função para listar tentativas com suporte a paginação e filtros
export async function getAttempts(params: AttemptSearchParams) {
  const queryParams = new URLSearchParams();
    // Adicionar parâmetros de paginação
  queryParams.append('page', params.page.toString());
  queryParams.append('limit', params.limit.toString());
  
  // Adicionar parâmetros de filtro, se existirem
  if (params.estudanteId) queryParams.append('estudanteId', params.estudanteId);
  if (params.quizId) queryParams.append('quizId', params.quizId);
  if (params.concluido !== undefined) queryParams.append('concluido', params.concluido.toString());
  if (params.dataInicio) queryParams.append('dataInicio', params.dataInicio);
  if (params.dataFim) queryParams.append('dataFim', params.dataFim);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  return fetchApi<QuizAttempt[]>(`/attempts?${queryParams.toString()}`, {
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}

// Função para obter uma tentativa específica
export async function getAttempt(id: string) {
  return fetchApi<QuizAttempt>(`/attempts/${id}`, {
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}

// Função para iniciar uma nova tentativa
export async function startAttempt(quizId: string) {
  return fetchApi<QuizAttempt>('/attempts', {
    method: 'POST',
    body: JSON.stringify({ quizId }),
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}

// Função para enviar resposta a uma questão
export async function submitAnswer(attemptId: string, answer: Omit<QuizAnswer, 'id' | 'attemptId' | 'createdAt' | 'updatedAt' | 'isCorrect' | 'score'>) {
  return fetchApi<QuizAnswer>(`/attempts/${attemptId}/answers`, {
    method: 'POST',
    body: JSON.stringify(answer),
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}

// Função para finalizar uma tentativa
export async function finishAttempt(attemptId: string) {
  return fetchApi<QuizAttempt>(`/attempts/${attemptId}/finish`, {
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}
