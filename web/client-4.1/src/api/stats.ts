import { PaginationData } from "../types/api";
import { ErrorResponse } from "../types/error";
import { UserStats } from "../types/stats";

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

// Função para obter estatísticas do usuário atual
export async function getUserStats() {
  return fetchApi<UserStats>('/stats', {
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}

// Função para obter estatísticas de um usuário específico (apenas para professores/admin)
export async function getUserStatsById(userId: string) {
  return fetchApi<UserStats>(`/stats/${userId}`, {
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}

// Função para obter estatísticas gerais de um quiz
export async function getQuizStats(quizId: string) {
  return fetchApi<{
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    completionRate: number;
    questionStats: Array<{
      questionId: string;
      correctRate: number;
      averageTimeSpent: number;
    }>;
  }>(`/stats/quiz/${quizId}`, {
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}
