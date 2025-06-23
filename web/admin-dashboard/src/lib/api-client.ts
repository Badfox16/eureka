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

    const url = `${API_BASE_URL}${endpoint}`;
    
    // Abordagem 1: Construir um novo objeto de headers condicionalmente
    let reqHeaders: HeadersInit = {
      ...headers,
      ...authHeaders
    };

    // Adicionar Content-Type apenas se não for FormData
    if (!(fetchOptions.body instanceof FormData)) {
      reqHeaders = {
        'Content-Type': 'application/json',
        ...reqHeaders
      };
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: reqHeaders,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Log para depuração
    console.log(`Resposta da API [${response.status}] para ${endpoint}`);
    
    let data;
    try {
      data = await response.json();
      // Log para ver a estrutura exata dos dados
      console.log('Dados da resposta:', data);
    } catch (jsonError) {
      console.error('Erro ao processar JSON:', jsonError);
      data = {};
    }

    if (!response.ok) {
      // Casos especiais para login/autenticação
      if (endpoint.includes('/auth/login') && response.status === 401) {
        // Para login, usamos uma mensagem mais amigável
        throw new ApiError(
          response.status,
          data.message || 'Email ou senha inválidos',
          data
        );
      } else if (response.status === 401) {
        // Para outras rotas, mantemos a mensagem de não autorizado
        throw new ApiError(
          response.status,
          data.message || 'Usuário não autorizado',
          data
        );
      } else {
        // Para outros erros
        throw new ApiError(
          response.status,
          data.message || `Erro ${response.status}`,
          data
        );
      }
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