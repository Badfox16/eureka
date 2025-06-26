import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/api/auth";
import * as usuarioApi from "@/api/usuario";
import { LoginRequest, RegisterRequest, Usuario, AuthResponse } from "@/types/usuario";
import { getAuthToken } from "@/api/apiService";

export function useAuth() {
  const queryClient = useQueryClient();
    // Consulta para obter o usuário atual
  const {
    data: usuario,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Usuario | null>({
    queryKey: ["usuario"],
    queryFn: async () => {
      console.log('Executando consulta de usuário atual...');      try {
        const token = getAuthToken();
        if (!token) {
          console.log('Nenhum token encontrado, retornando null');
          return null;
        }
        
        const response = await authApi.getCurrentUser();
        if ('error' in response) {
          console.error('Erro na resposta da API:', response.error);
          return null;
        }
        if (!response.data) {
          console.warn('Resposta da API sem dados do usuário');
          return null;
        }
        console.log('Usuário atual recuperado com sucesso:', response.data);
        return response.data;
      } catch (error) {
        console.error("Erro ao obter usuário:", error);
        return null;
      }
    },
    // Carrega automaticamente se houver token
    enabled: typeof window !== 'undefined' && !!getAuthToken(), 
    // Refaz a consulta a cada 15 minutos para verificar se o token ainda é válido
    refetchInterval: 15 * 60 * 1000,
    // Refaz a consulta quando a janela volta a ter foco
    refetchOnWindowFocus: true,
    // Não tenta novamente se ocorrer erro
    retry: false,    // Não exibir erro se não estiver autenticado
    throwOnError: false,
  });
  
  // Mutação para login
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (response) => {
      if (response.data) {
        console.log('Login bem-sucedido, atualizando estado do usuário');
        queryClient.setQueryData(["usuario"], response.data.usuario);
        // Força uma nova consulta para garantir que temos os dados mais recentes
        await refetch();
      }
    },
  });
  // Mutação para registro
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: async (response) => {
      if (response.data) {
        console.log('Registro bem-sucedido, atualizando estado do usuário');
        queryClient.setQueryData(["usuario"], response.data.usuario);
        // Força uma nova consulta para garantir que temos os dados mais recentes
        await refetch();
      }
    },
  });  // Mutação para logout
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      console.log('Logout bem-sucedido, limpando estado');
      queryClient.setQueryData(["usuario"], null);
      // Invalidar todas as queries no cache
      queryClient.invalidateQueries();
      // Garantir que o localStorage seja limpo
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      }
    },
  });

  // Mutação para alterar a senha
  const alterarSenhaMutation = useMutation({
    mutationFn: (data: { senhaAtual: string; novaSenha: string }) =>
      usuarioApi.alterarSenha(data),
  });
  // Verifica se o usuário está autenticado
  const isAuthenticated = !!usuario;

  // Função para fazer login
  const login = useCallback(
    (data: LoginRequest) => loginMutation.mutateAsync(data),
    [loginMutation]
  );

  // Função para fazer registro
  const register = useCallback(
    (data: RegisterRequest) => registerMutation.mutateAsync(data),
    [registerMutation]
  );

  // Função para fazer logout
  const logout = useCallback(
    () => logoutMutation.mutateAsync(),
    [logoutMutation]
  );

  // Função para alterar a senha
  const alterarSenha = useCallback(
    (data: { senhaAtual: string; novaSenha: string; confirmarSenha: string }) => {
      const { confirmarSenha, ...rest } = data;
      return alterarSenhaMutation.mutateAsync(rest);
    },
    [alterarSenhaMutation]
  );
  return {
    usuario,
    isAuthenticated,
    isLoading,
    isError,
    error,
    login,
    register,
    logout,
    alterarSenha,
    refetch,
    loginStatus: loginMutation.status,
    registerStatus: registerMutation.status,
    logoutStatus: logoutMutation.status,
    alterarSenhaStatus: alterarSenhaMutation.status, // Adicionado para consistência
  };
}
