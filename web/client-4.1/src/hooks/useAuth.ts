import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as authApi from "@/api/auth";
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
  } = useQuery<Usuario | undefined>({
    queryKey: ["usuario"],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
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
      queryClient.setQueryData(["usuario"], undefined);
      // Invalidar todas as queries no cache
      queryClient.invalidateQueries();
    },
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

  return {
    usuario,
    isAuthenticated,
    isLoading,
    isError,
    error,
    login,
    register,
    logout,
    refetch,
  };
}
