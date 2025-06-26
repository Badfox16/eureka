import { toast } from 'sonner';
import { ApiError } from './api-client';

// Interface para resposta de erro da API
interface ApiErrorResponse {
  status: string;
  message: string;
}

/**
 * Extrai a mensagem de erro da resposta da API
 */
function extractErrorMessage(error: any): string {
  if (error instanceof ApiError && error.data) {
    const apiError = error.data as ApiErrorResponse;
    return apiError.message || error.message;
  }
  
  if (error.response?.data) {
    const apiError = error.response.data as ApiErrorResponse;
    return apiError.message || error.message;
  }
  
  return error.message || 'Ocorreu um erro inesperado';
}

/**
 * Trata erros da API e exibe um toast de erro padrão.
 */
export function handleApiError(error: unknown, context?: string): string {
  console.error(`[${context || 'API Error'}]`, error);
  const message = extractErrorMessage(error);
  toast.error(message);
  return message;
}

/**
 * Exibe toast de sucesso com opção de tema.
 */
export function showSuccessToast(message: string, forceTheme?: 'light') {
  toast.success(message, {
    className: forceTheme === 'light' ? 'toast-always-light' : undefined,
  });
}

/**
 * Exibe toast de erro com opção de tema.
 */
export function showErrorToast(message: string, forceTheme?: 'light') {
  toast.error(message, {
    className: forceTheme === 'light' ? 'toast-always-light' : undefined,
  });
}

/**
 * Exibe toast de aviso com opção de tema.
 */
export function showWarningToast(message: string, forceTheme?: 'light') {
  toast.warning(message, {
    className: forceTheme === 'light' ? 'toast-always-light' : undefined,
  });
}