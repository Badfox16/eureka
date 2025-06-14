'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { TipoUsuario } from '@/types';
import { hasRole } from '@/lib/auth';
import { useAuth as useAuthContext } from '@/providers/auth-provider';
import { ApiError } from '@/lib/api-client';

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
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        // Adicionar logs para depuração
        console.log('Tentando login com:', { email: credentials.email });
        
        const result = await authService.login(credentials);
        console.log('Login bem-sucedido:', result);
        
        return result;
      } catch (error) {
        console.error('Erro no login:', error);
        
        if (error instanceof ApiError && error.status === 401) {
          return { 
            success: false, 
            errorMessage: 'Email ou senha inválidos',
            originalError: error 
          };
        }
        
        return { 
          success: false, 
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
          originalError: error 
        };
      }
    },
    onSuccess: (result: any) => {
      // Verificamos se o resultado é um objeto de erro
      if (result && result.success === false) {
        toast.error(result.errorMessage);
        return;
      }
      
      // Armazenar o token e os dados do usuário
      if (result.token) {
        authService.storeToken(result.token);
      }
      
      // Atualizar o cache
      if (result.user) {
        queryClient.setQueryData(['user'], result.user);
      }
      
      toast.success('Login realizado com sucesso!');
      
      // Adicionar um pequeno atraso para garantir que o cookie seja definido
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 300);
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
        // Tentar logout no servidor
        await authService.logout();
      } catch (error) {
        console.error("Erro ao fazer logout no servidor:", error);
        // Continua mesmo com erro no servidor
      } finally {
        // Limpar dados locais
        authService.removeToken();
        queryClient.clear();
        
        // Redirecionar para login
        window.location.href = '/auth/login';
      }
    },
    onSuccess: () => {
      toast.success('Logout realizado com sucesso');
    },
    onError: () => {
      toast.success('Logout realizado com sucesso');
      // Mostramos sucesso mesmo com erro, pois o importante é o token local ter sido removido
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