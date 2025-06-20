import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/api/auth";
import * as usuarioApi from "@/api/usuario";
import { LoginRequest, RegisterRequest, Usuario } from "@/types/usuario";

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
      const response = await authApi.getCurrentUser();      if ('error' in response) {
        return null;
      }
      if (!response.data) {
        return null;
      }
      return response.data;
    },
    retry: false,
    // Não exibir erro se não estiver autenticado
    throwOnError: false,
  });
  // Mutação para login
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData(["usuario"], response.data.usuario);
      }
    },
  });

  // Mutação para registro
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData(["usuario"], response.data.usuario);
      }
    },
  });
  // Mutação para logout
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["usuario"], null);
      // Invalidar todas as queries no cache
      queryClient.invalidateQueries();
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
  };
}
