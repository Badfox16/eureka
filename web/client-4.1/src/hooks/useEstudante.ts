import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import * as estudanteApi from "@/api/estudante";
import { Estudante } from "@/types/estudante";
import { EstudanteSearchParams } from "@/types/search";
import { EstudanteQuiz } from "@/types/estudanteQuiz";

export function useEstudantes(params?: EstudanteSearchParams) {
  // Valor padrão para os parâmetros de busca
  const defaultParams: EstudanteSearchParams = {
    page: 1,
    limit: 10,
    ...params,
  };

  // Consulta para obter estudantes
  const {
    data: resultado,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["estudantes", defaultParams],
    queryFn: async () => {
      const response = await estudanteApi.getEstudantes(defaultParams);
      return {
        estudantes: response.data || [],
        pagination: response.pagination,
      };
    },
  });

  return {
    estudantes: resultado?.estudantes || [],
    pagination: resultado?.pagination,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useEstudante(estudanteId?: string) {
  const queryClient = useQueryClient();
  // Consulta para obter um estudante específico
  const {
    data: estudante,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Estudante | null>({
    queryKey: ["estudante", estudanteId],
    queryFn: async () => {
      if (!estudanteId) return null;
      const response = await estudanteApi.getEstudante(estudanteId);
      return response.data || null;
    },
    enabled: !!estudanteId,
  });
  // Consulta para obter os quizzes de um estudante
  const {
    data: quizzes,
    isLoading: isLoadingQuizzes,
    isError: isErrorQuizzes,
    error: errorQuizzes,
    refetch: refetchQuizzes,
  } = useQuery<EstudanteQuiz[] | null>({
    queryKey: ["estudante", estudanteId, "quizzes"],
    queryFn: async () => {
      if (!estudanteId) return null;
      const response = await estudanteApi.getQuizzesEstudante(estudanteId);
      return response.data || null;
    },
    enabled: !!estudanteId,
  });

  return {
    estudante,
    isLoading,
    isError,
    error,
    refetch,
    quizzes: {
      data: quizzes,
      isLoading: isLoadingQuizzes,
      isError: isErrorQuizzes,
      error: errorQuizzes,
      refetch: refetchQuizzes,
    },
  };
}

export function usePerfilEstudante() {
  const queryClient = useQueryClient();

  // Consulta para obter o perfil do estudante atual
  const {
    data: perfil,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Estudante | null>({
    queryKey: ["perfil-estudante"],
    queryFn: async () => {
      const response = await estudanteApi.getPerfilEstudante();
      return response.data || null;
    },
  });

  // Mutação para atualizar senha
  const atualizarSenhaMutation = useMutation({
    mutationFn: (dados: { senhaAtual: string; novaSenha: string }) =>
      estudanteApi.atualizarSenhaEstudante(dados.senhaAtual, dados.novaSenha),
  });

  // Função para atualizar senha
  const atualizarSenha = useCallback(
    (senhaAtual: string, novaSenha: string) =>
      atualizarSenhaMutation.mutateAsync({ senhaAtual, novaSenha }),
    [atualizarSenhaMutation]
  );

  return {
    perfil,
    isLoading,
    isError,
    error,
    refetch,
    atualizarSenha,
    isAtualizandoSenha: atualizarSenhaMutation.isPending,
    erroAtualizarSenha: atualizarSenhaMutation.error,
  };
}
