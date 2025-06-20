import { ApiResponse, PaginationData } from "@/types/api";
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
): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${API_PREFIX}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    const data = await res.json();

    if (!res.ok) {
      throw {
        success: false,
        error: {
          code: res.status.toString(),
          message: data.message || 'Erro desconhecido',
          details: data.details,
        },
      };
    }

    return {
      success: true,
      ...data,
    } as T;
  } catch (error) {
    if (error && typeof error === 'object' && 'success' in error) {
      throw error;
    }
    throw {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
    };
  }
}

// Função auxiliar para criar headers de autenticação
export function createAuthHeaders(): Headers {
  const headers = new Headers();
  const token = localStorage.getItem('token');
  
  headers.append('Content-Type', 'application/json');
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  
  return headers;
}

// Função auxiliar para construir query strings
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}
