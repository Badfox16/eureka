'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { TipoUsuario } from '@/types';
import { hasRole } from '@/lib/auth';
import { useAuth as useAuthContext } from '@/providers/auth-provider';
import { ApiError } from '@/lib/api-client';
import { handleApiError, showSuccessToast } from '@/lib/error-utils';

// Re-exporta o hook principal de autenticação do provider
export function useAuth() {
  return useAuthContext();
}

// Interface para credenciais
interface LoginCredentials {
  email: string;
  password: string;
}

// Hook para fazer login
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (result) => {
      if (result.token) {
        authService.storeToken(result.token);
      }
      if (result.user) {
        queryClient.setQueryData(['user'], result.user);
      }
      
      showSuccessToast('Login realizado com sucesso!');
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 300);
    },
    onError: (error) => {
      handleApiError(error, 'Login');
    }
  });
}

// Hook para fazer logout
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch (error) {
        console.error("Erro no logout do servidor (continuando localmente):", error);
      } finally {
        authService.removeToken();
        queryClient.clear();
      }
    },
    onSuccess: () => {
      showSuccessToast('Logout realizado com sucesso');
      window.location.href = '/auth/login';
    },
    onError: () => {
      // Mesmo com erro, o logout local foi feito. O importante é o usuário ser deslogado.
      showSuccessToast('Logout realizado com sucesso');
      window.location.href = '/auth/login';
    }
  });
}

// Hook para verificar se o usuário tem determinada permissão
export function useHasPermission(requiredRole: TipoUsuario) {
  const { user } = useAuth();
  
  if (!user) return false;
  
  // Se o usuário for admin, tem todas as permissões
  if (user.tipo === TipoUsuario.ADMIN) return true;
  
  // Caso contrário, verifica o papel específico
  return user.tipo === requiredRole;
}

// Hook para verificar se o usuário atual é admin
export function useIsAdmin() {
  const { user } = useAuth();
  return user?.tipo === TipoUsuario.ADMIN;
}

// Hook para verificar se o usuário atual é professor (ou admin)
export function useIsProfessor() {
  const { user } = useAuth();
  return user?.tipo === TipoUsuario.ADMIN || user?.tipo === TipoUsuario.PROFESSOR;
}

// Hook para obter o usuário atual
export function useCurrentUser() {
  const { user } = useAuth();
  return user;
}