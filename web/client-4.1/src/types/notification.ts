import { Usuario } from "./usuario";

// Modelo de notificação
export type Notificacao = {
  id: string;
  usuario: string | Usuario;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  urlAcao?: string;
  dataCriacao: string;
  dataAtualizacao: string;
};

// Enum para tipos de notificação
export enum TipoNotificacao {
  CONVITE_QUIZ = 'convite_quiz',
  RESULTADO_QUIZ = 'resultado_quiz',
  CONQUISTA = 'conquista',
  SISTEMA = 'sistema',
  AVISO = 'aviso',
  ALERTA = 'alerta'
}

// DTO para contagem de notificações não lidas
export type NotificacaoContadorResponse = {
  contador: number;
};

// DTO para resposta de marcar como lida/excluir
export type NotificacaoAcaoResponse = {
  sucesso: boolean;
};
