import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import * as notificationApi from "@/api/notification";
import { Notificacao } from "@/types/notification";
import { NotificacaoSearchParams } from "@/types/search";

export function useNotifications() {
  const queryClient = useQueryClient();

  // Consulta para obter notificações do usuário atual
  const {
    data: notificacoes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Notificacao[]>({
    queryKey: ["notificacoes"],
    queryFn: async () => {
      const response = await notificationApi.getNotificacoes();
      return response.data || [];
    },
  });

  // Consulta para obter o contador de notificações não lidas
  const {
    data: contadorNaoLidas,
    refetch: refetchContador,
  } = useQuery<number>({
    queryKey: ["notificacoes-contador"],
    queryFn: async () => {
      const response = await notificationApi.getContadorNaoLidas();
      return response.data?.contador || 0;
    },
  });

  // Mutação para marcar uma notificação como lida
  const marcarComoLidaMutation = useMutation({
    mutationFn: (notificacaoId: string) => 
      notificationApi.marcarComoLida(notificacaoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      queryClient.invalidateQueries({ queryKey: ["notificacoes-contador"] });
    },
  });

  // Mutação para marcar todas as notificações como lidas
  const marcarTodasComoLidasMutation = useMutation({
    mutationFn: () => notificationApi.marcarTodasComoLidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
      queryClient.invalidateQueries({ queryKey: ["notificacoes-contador"] });
    },
  });

  // Mutação para excluir uma notificação
  const excluirNotificacaoMutation = useMutation({
    mutationFn: (notificacaoId: string) => 
      notificationApi.excluirNotificacao(notificacaoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificacoes"] });
    },
  });

  // Função para marcar uma notificação como lida
  const marcarComoLida = useCallback(
    (notificacaoId: string) => marcarComoLidaMutation.mutateAsync(notificacaoId),
    [marcarComoLidaMutation]
  );

  // Função para marcar todas as notificações como lidas
  const marcarTodasComoLidas = useCallback(
    () => marcarTodasComoLidasMutation.mutateAsync(),
    [marcarTodasComoLidasMutation]
  );

  // Função para excluir uma notificação
  const excluirNotificacao = useCallback(
    (notificacaoId: string) => excluirNotificacaoMutation.mutateAsync(notificacaoId),
    [excluirNotificacaoMutation]
  );

  return {
    notificacoes: notificacoes || [],
    contadorNaoLidas: contadorNaoLidas || 0,
    isLoading,
    isError,
    error,
    marcarComoLida,
    marcarTodasComoLidas,
    excluirNotificacao,
    refetch,
    refetchContador,
  };
}
