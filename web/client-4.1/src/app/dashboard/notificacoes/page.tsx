"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Bell, Trash2, BellOff, RefreshCcw } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { NotificacaoSearchParams } from "@/types/search";

export default function NotificacoesPage() {
  const [searchParams, setSearchParams] = useState<NotificacaoSearchParams>({
    page: 1,
    limit: 10
  });

  const { 
    notificacoes, 
    pagination,
    contadorNaoLidas, 
    isLoading, 
    marcarComoLida, 
    marcarTodasComoLidas, 
    excluirNotificacao,
    refetch
  } = useNotifications(searchParams);
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Função para formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    
    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje, ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (data.toDateString() === ontem.toDateString()) {
      return 'Ontem, ' + data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return data.toLocaleDateString('pt-BR', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Função para lidar com ações nas notificações
  const handleAction = async (action: 'ler' | 'excluir', id: string) => {
    try {
      setActionLoading(id);
      if (action === 'ler') {
        await marcarComoLida(id);
      } else {
        await excluirNotificacao(id);
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Função para marcar todas como lidas
  const handleMarcarTodasComoLidas = async () => {
    try {
      setActionLoading('all');
      await marcarTodasComoLidas();
    } finally {
      setActionLoading(null);
    }
  };
  // Função para mudar de página
  const handlePageChange = (newPageNumber: number) => {
    setSearchParams((prev: { page: number; limit: number }) => ({ ...prev, page: newPageNumber }));
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Notificações</h1>
            {contadorNaoLidas > 0 && (
              <Badge variant="secondary" className="text-sm">
                {contadorNaoLidas} não {contadorNaoLidas === 1 ? 'lida' : 'lidas'}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleMarcarTodasComoLidas}
              disabled={isLoading || actionLoading !== null || !notificacoes.length}
            >
              {actionLoading === 'all' ? (
                <RefreshCcw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {notificacoes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Nenhuma notificação encontrada
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notificacoes.map((notificacao) => (
              <Card key={notificacao.id} className={notificacao.lida ? 'bg-muted/30' : ''}>
                <CardContent className="flex items-start justify-between p-4">
                  <div className="flex items-start gap-4 flex-grow">
                    <Bell className={`h-5 w-5 mt-1 ${notificacao.lida ? 'text-muted-foreground' : 'text-primary'}`} />
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {notificacao.titulo}
                        </p>
                        {!notificacao.lida && (
                          <Badge variant="secondary" className="text-xs">
                            Nova
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notificacao.mensagem}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatarData(notificacao.dataCriacao)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!notificacao.lida && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction('ler', notificacao.id)}
                        disabled={actionLoading === notificacao.id}
                      >
                        {actionLoading === notificacao.id ? (
                          <RefreshCcw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAction('excluir', notificacao.id)}
                      disabled={actionLoading === notificacao.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevious}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              Anterior
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === pagination.currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNext}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
