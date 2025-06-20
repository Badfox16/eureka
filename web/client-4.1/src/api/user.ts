import { PaginationData } from "../types/api";
import { ErrorResponse } from "../types/error";
import { Usuario } from "../types/usuario";
import { UserSearchParams } from "../types/search";

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

// Função para listar usuários com suporte a paginação e filtros
export async function getUsers(params: UserSearchParams) {
  const queryParams = new URLSearchParams();
  // Adicionar parâmetros de paginação
  queryParams.append('page', params.page.toString());
  queryParams.append('limit', params.limit.toString());
  
  // Adicionar parâmetros de filtro, se existirem
  if (params.search) queryParams.append('search', params.search);
  if (params.tipo) queryParams.append('tipo', params.tipo);
  if (params.ativo !== undefined) queryParams.append('ativo', params.ativo.toString());
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  return fetchApi<Usuario[]>(`/users?${queryParams.toString()}`, {
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}

// Função para obter um usuário específico
export async function getUser(id: string) {
  return fetchApi<Usuario>(`/users/${id}`, {
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}

// Função para atualizar perfil do usuário
export async function updateUserProfile(userData: Partial<Usuario>) {
  return fetchApi<Usuario>('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}

// Função para atualizar senha do usuário
export async function updatePassword(data: { 
  currentPassword: string; 
  newPassword: string; 
  confirmPassword: string 
}) {
  return fetchApi<{ success: boolean }>('/users/password', {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}
