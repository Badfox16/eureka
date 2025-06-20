import { Usuario } from "./usuario";

// Modelo de notificação
export type Notificacao = {
  _id: string;
  usuario: string | Usuario;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  urlAcao?: string;
  createdAt: string;
  updatedAt: string;
};

// Enum para tipos de notificação
export enum TipoNotificacao {
  CONVITE_QUIZ = 'convite_quiz',
  RESULTADO_QUIZ = 'resultado_quiz',
  CONQUISTA = 'conquista',
  SISTEMA = 'sistema'
}

// Tipos para operações com notificação
export type CreateNotificacaoInput = {
  usuario: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  urlAcao?: string;
};

export type UpdateNotificacaoInput = Partial<CreateNotificacaoInput> & {
  lida?: boolean;
};

// Tipo para filtros de busca de notificações
export type NotificacaoSearchParams = {
  page: number;
  limit: number;
  usuarioId?: string;
  tipo?: TipoNotificacao;
  lida?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

// Mantendo compatibilidade com o código existente
// até que seja totalmente refatorado
export type Notification = Notificacao;
export const NotificationType = TipoNotificacao;
