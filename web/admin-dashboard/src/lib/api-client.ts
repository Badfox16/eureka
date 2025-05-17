import { API_BASE_URL, API_TIMEOUT } from '@/config/api';
import { getToken } from '@/lib/auth';

type RequestOptions = Omit<RequestInit, 'signal'> & {
  timeout?: number;
  withAuth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { 
    timeout = API_TIMEOUT, 
    withAuth = true,
    headers = {},
    ...fetchOptions 
  } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Adiciona o token de autenticação se necessário
    const authHeaders: HeadersInit = {};
    if (withAuth) {
      const token = getToken();
      if (token) {
        authHeaders.Authorization = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || `Erro ${response.status}`,
        data
      );
    }
    
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Requisição excedeu o tempo limite');
    }
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, (error as Error).message || 'Erro desconhecido');
  }
}