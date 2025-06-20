import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import * as notificationApi from "@/api/notification";
import { Notificacao, NotificacaoContadorResponse } from "@/types/notification";
import { NotificacaoSearchParams } from "@/types/search";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export function useNotifications(searchParams: NotificacaoSearchParams = { page: 1, limit: 10 }) {
  const queryClient = useQueryClient();

  // Consulta para obter notificações do usuário atual
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Notificacao>>({
    queryKey: ["notificacoes", searchParams],
    queryFn: async () => {
      const response = await notificationApi.getNotificacoes(searchParams);
      return response;
    },
  });

  // Consulta para obter o contador de notificações não lidas
  const {
    data: contadorData,
    refetch: refetchContador,
  } = useQuery<ApiResponse<NotificacaoContadorResponse>>({
    queryKey: ["notificacoes-contador"],
    queryFn: async () => {
      const response = await notificationApi.getContadorNaoLidas();
      return response;
    },
  });

  // Mutação para marcar uma notificação como lida
  const marcarComoLidaMutation = useMutation<ApiResponse<Notificacao>, Error, string>({
    mutationFn: (id: string) => notificationApi.marcarComoLida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      queryClient.invalidateQueries({ queryKey: ["notificacoes-contador"] });
    },
  });

  // Mutação para marcar todas as notificações como lidas
  const marcarTodasComoLidasMutation = useMutation<ApiResponse<void>, Error>({
    mutationFn: () => notificationApi.marcarTodasComoLidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      queryClient.invalidateQueries({ queryKey: ["notificacoes-contador"] });
    },
  });

  // Mutação para excluir uma notificação
  const excluirNotificacaoMutation = useMutation<ApiResponse<void>, Error, string>({
    mutationFn: (id: string) => notificationApi.excluirNotificacao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      queryClient.invalidateQueries({ queryKey: ["notificacoes-contador"] });
    },
  });

  const marcarComoLida = useCallback(async (id: string) => {
    await marcarComoLidaMutation.mutateAsync(id);
  }, [marcarComoLidaMutation]);

  const marcarTodasComoLidas = useCallback(async () => {
    await marcarTodasComoLidasMutation.mutateAsync();
  }, [marcarTodasComoLidasMutation]);

  const excluirNotificacao = useCallback(async (id: string) => {
    await excluirNotificacaoMutation.mutateAsync(id);
  }, [excluirNotificacaoMutation]);

  return {
    notificacoes: data?.data || [],
    pagination: data?.pagination,
    contadorNaoLidas: contadorData?.data?.contador || 0,
    isLoading,
    isError,
    error,
    refetch,
    marcarComoLida,
    marcarTodasComoLidas,
    excluirNotificacao,
  };
}
