import { PaginationData } from "@/types/api";
import { ErrorResponse } from "@/types/error";

// URL base da API (pode ser configurada em um arquivo .env)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eureka.edu.br';

// Prefixo da API
const API_PREFIX = '/api/v1';

// Opções padrão para requisições fetch
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Função auxiliar para requisições fetch com tratamento de erros
export async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<{
  data?: T;
  error?: ErrorResponse;
  pagination?: PaginationData;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_URL}${API_PREFIX}${endpoint}`, {
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
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

// Função para converter parâmetros de busca em string de consulta
export function buildQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Função para criar headers com autenticação
export function createAuthHeaders(): HeadersInit {
  return {
    ...defaultOptions.headers,
    'Authorization': `Bearer ${getAuthToken()}`,
  } as HeadersInit;
}
