'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/config/api';
import { getToken, removeToken, setToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Usuario } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: Usuario;
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient<AuthResponse>(ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
        withAuth: false,
      });
      
      return response;
    },
    onSuccess: (data) => {
      setToken(data.token);
      queryClient.setQueryData(['user'], data.user);
      router.push('/dashboard');
      toast.success('Login realizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Falha ao realizar login');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      if (getToken()) {
        await apiClient(ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
      }
      return true;
    },
    onSuccess: () => {
      removeToken();
      queryClient.clear();
      router.push('/auth/login');
      toast.success('Logout realizado com sucesso');
    },
    onError: () => {
      // Mesmo com erro, tentamos fazer logout localmente
      removeToken();
      queryClient.clear();
      router.push('/auth/login');
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient<Usuario>(ENDPOINTS.AUTH.ME),
    enabled: !!getToken(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}