import { toast } from 'sonner';
import { ApiError } from './api-client';

export function handleApiError(error: unknown): string {
  // Erro da API
  if (error instanceof ApiError) {
    const message = error.message || 'Ocorreu um erro na requisição';
    
    // Tratamentos específicos por código de erro
    if (error.status === 401) {
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      // Caso queira redirecionar para login:
      // window.location.href = '/auth/login';
    } else if (error.status === 403) {
      toast.error('Você não tem permissão para realizar esta ação');
    } else if (error.status === 404) {
      toast.error('Recurso não encontrado');
    } else if (error.status >= 500) {
      toast.error('Erro no servidor. Tente novamente mais tarde.');
    } else {
      toast.error(message);
    }
    
    return message;
  }
  
  // Outros tipos de erro
  if (error instanceof Error) {
    const message = error.message || 'Ocorreu um erro inesperado';
    toast.error(message);
    return message;
  }
  
  // Fallback
  const fallbackMessage = 'Ocorreu um erro inesperado';
  toast.error(fallbackMessage);
  return fallbackMessage;
}