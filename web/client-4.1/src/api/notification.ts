import { ApiResponse, PaginatedResponse } from "@/types/api";
import { Notificacao } from "@/types/notification";
import { NotificacaoSearchParams } from "@/types/search";
import { fetchApi, buildQueryString, createAuthHeaders } from "./apiService";

// Função para obter notificações do usuário com paginação
export async function getNotificacoes(params: NotificacaoSearchParams = { page: 1, limit: 10 }): Promise<PaginatedResponse<Notificacao>> {
  const queryString = buildQueryString(params);
  
  return fetchApi<PaginatedResponse<Notificacao>>(`/notificacoes${queryString}`, {
    headers: createAuthHeaders(),
  });
}

// Função para obter contador de notificações não lidas
export async function getContadorNaoLidas(): Promise<ApiResponse<{ contador: number }>> {
  return fetchApi<ApiResponse<{ contador: number }>>(`/notificacoes/contador-nao-lidas`, {
    headers: createAuthHeaders(),
  });
}

// Função para marcar notificação como lida
export async function marcarComoLida(id: string): Promise<ApiResponse<Notificacao>> {
  return fetchApi<ApiResponse<Notificacao>>(`/notificacoes/${id}/ler`, {
    method: 'POST',
    headers: createAuthHeaders(),
  });
}

// Função para marcar todas as notificações como lidas
export async function marcarTodasComoLidas(): Promise<ApiResponse<void>> {
  return fetchApi<ApiResponse<void>>(`/notificacoes/ler-todas`, {
    method: 'POST',
    headers: createAuthHeaders(),
  });
}

// Função para excluir uma notificação
export async function excluirNotificacao(id: string): Promise<ApiResponse<void>> {
  return fetchApi<ApiResponse<void>>(`/notificacoes/${id}`, {
    method: 'DELETE',
    headers: createAuthHeaders(),
  });
}
