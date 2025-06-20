"use client";

import { createContext, useContext, ReactNode } from 'react';
import { ApiStatus } from '@/types/api';
import { Notificacao } from '@/types/notification';
import { useNotifications as useNotificationsHook } from '@/hooks/useNotifications';

type NotificationsContextType = {
  notificacoes: Notificacao[];
  contadorNaoLidas: number;
  status: ApiStatus;
  error: string | null;
  marcarComoLida: (notificacaoId: string) => Promise<any>;
  marcarTodasComoLidas: () => Promise<any>;
  excluirNotificacao: (notificacaoId: string) => Promise<any>;
  recarregarNotificacoes: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { 
    notificacoes, 
    contadorNaoLidas, 
    isLoading, 
    isError, 
    error: notificationsError, 
    marcarComoLida: marcarComoLidaFn, 
    marcarTodasComoLidas: marcarTodasComoLidasFn, 
    excluirNotificacao: excluirNotificacaoFn,
    refetch 
  } = useNotificationsHook();

  // Converter status do React Query para ApiStatus
  let status = ApiStatus.IDLE;
  if (isLoading) status = ApiStatus.LOADING;
  else if (isError) status = ApiStatus.ERROR;
  else if (notificacoes.length > 0) status = ApiStatus.SUCCESS;

  // Função para marcar como lida
  const marcarComoLida = async (notificacaoId: string) => {
    return marcarComoLidaFn(notificacaoId);
  };

  // Função para marcar todas como lidas
  const marcarTodasComoLidas = async () => {
    return marcarTodasComoLidasFn();
  };

  // Função para excluir notificação
  const excluirNotificacao = async (notificacaoId: string) => {
    return excluirNotificacaoFn(notificacaoId);
  };

  // Função para recarregar notificações
  const recarregarNotificacoes = () => {
    refetch();
  };

  return (
    <NotificationsContext.Provider value={{ 
      notificacoes, 
      contadorNaoLidas, 
      status, 
      error: notificationsError?.message || null, 
      marcarComoLida, 
      marcarTodasComoLidas, 
      excluirNotificacao,
      recarregarNotificacoes
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
