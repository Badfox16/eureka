import { PaginationData } from "../types/api";
import { ErrorResponse } from "../types/error";
import { Notification } from "../types/notification";

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

// Função para obter notificações do usuário com paginação
export async function getNotifications(page: number = 1, limit: number = 10) {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  
  return fetchApi<Notification[]>(`/notifications?${queryParams.toString()}`, {
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}

// Função para marcar notificação como lida
export async function markNotificationAsRead(id: string) {
  return fetchApi<Notification>(`/notifications/${id}/read`, {
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}

// Função para marcar todas as notificações como lidas
export async function markAllNotificationsAsRead() {
  return fetchApi<{ success: boolean }>('/notifications/read-all', {
    method: 'POST',
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}

// Função para excluir uma notificação
export async function deleteNotification(id: string) {
  return fetchApi<{ success: boolean }>(`/notifications/${id}`, {
    method: 'DELETE',
    headers: {
      ...defaultOptions.headers,
      'Authorization': `Bearer ${getAuthToken()}`,
    } as HeadersInit,
  });
}
