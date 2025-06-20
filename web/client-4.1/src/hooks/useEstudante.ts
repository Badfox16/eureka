import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import * as estudanteApi from "@/api/estudante";
import { Estudante } from "@/types/estudante";
import { EstudanteSearchParams } from "@/types/search";
import { EstudanteQuiz } from "@/types/estudanteQuiz";
import { ApiResponse, PaginatedResponse } from "@/types/api";
import { EstatisticasEstudante, EstatisticaDisciplina, EvolucaoDesempenho } from "@/types/estatisticas";

export function useEstudantes(params?: EstudanteSearchParams) {
  // Valor padrão para os parâmetros de busca
  const defaultParams: EstudanteSearchParams = {
    page: 1,
    limit: 10,
    ...params,
  };

  // Consulta para obter estudantes
  const {
    data: estudantesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PaginatedResponse<Estudante>>({
    queryKey: ["estudantes", defaultParams],
    queryFn: () => estudanteApi.getEstudantes(defaultParams),
  });

  return {
    estudantes: estudantesResponse?.data || [],
    pagination: estudantesResponse?.pagination,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Hook principal que combina todas as funcionalidades relacionadas ao estudante
export function useEstudante() {
  return {
    usePerfilEstudante,
    useQuizzesEstudante,
    useEstudantes,
    useQuizzes,
  };
}

export function usePerfilEstudante() {
  const queryClient = useQueryClient();

  // Consulta para obter perfil do estudante
  const {
    data: perfilResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ApiResponse<Estudante | null>>({
    queryKey: ["perfil-estudante"],
    queryFn: () => estudanteApi.getPerfilEstudante(),
    retry: false, // Não tentar novamente em caso de erro
  });

  // Mutation para atualizar perfil
  const updatePerfilMutation = useMutation<ApiResponse<Estudante>, Error, estudanteApi.UpdateEstudanteInput>({
    mutationFn: (dados) => estudanteApi.updatePerfilEstudante(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["perfil-estudante"] });
    },
  });

  // Mutation para atualizar senha
  const updateSenhaMutation = useMutation<ApiResponse<{ sucesso: boolean }>, Error, { senhaAtual: string; novaSenha: string }>({
    mutationFn: ({ senhaAtual, novaSenha }) => estudanteApi.atualizarSenhaEstudante(senhaAtual, novaSenha),
  });

  // Handler para atualizar perfil
  const updatePerfil = useCallback(async (dados: estudanteApi.UpdateEstudanteInput) => {
    const response = await updatePerfilMutation.mutateAsync(dados);
    return response;
  }, [updatePerfilMutation]);

  // Handler para atualizar senha
  const updateSenha = useCallback(async (senhaAtual: string, novaSenha: string) => {
    const response = await updateSenhaMutation.mutateAsync({ senhaAtual, novaSenha });
    return response;
  }, [updateSenhaMutation]);

  return {
    estudante: perfilResponse?.data,
    isLoading,
    isError,
    error,
    refetch,
    updatePerfil,
    updateSenha,
  };
}

export function useQuizzesEstudante(estudanteId: string) {
  // Consulta para obter quizzes do estudante
  const {
    data: quizzesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PaginatedResponse<EstudanteQuiz>>({
    queryKey: ["quizzes-estudante", estudanteId],
    queryFn: () => estudanteApi.getQuizzesEstudante(estudanteId),
  });

  return {
    quizzes: quizzesResponse?.data || [],
    pagination: quizzesResponse?.pagination,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useQuizzes(estudanteId?: string) {
  const {
    data: quizzes,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PaginatedResponse<EstudanteQuiz>>({
    queryKey: ["estudante", estudanteId, "quizzes"],
    queryFn: async () => {
      if (!estudanteId) return {
        data: [],
        pagination: {
          total: 0,
          totalPages: 0,
          currentPage: 1,
          perPage: 10,
          hasNext: false,
          hasPrevious: false
        }
      };
      return estudanteApi.getQuizzesEstudante(estudanteId);
    },
    enabled: !!estudanteId,
  });

  return {
    quizzes: quizzes?.data || [],
    pagination: quizzes?.pagination,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useEstatisticasEstudante(estudanteId: string) {
  // Consulta para obter estatísticas gerais
  const {
    data: estatisticasResponse,
    isLoading: estatisticasLoading,
    isError: estatisticasError,
    error: estatisticasErrorData,
  } = useQuery<ApiResponse<EstatisticasEstudante>>({
    queryKey: ["estatisticas-estudante", estudanteId],
    queryFn: () => estudanteApi.getEstatisticasEstudante(estudanteId),
  });

  // Consulta para obter estatísticas por disciplina
  const {
    data: disciplinasResponse,
    isLoading: disciplinasLoading,
    isError: disciplinasError,
    error: disciplinasErrorData,
  } = useQuery<ApiResponse<EstatisticaDisciplina[]>>({
    queryKey: ["estatisticas-disciplinas", estudanteId],
    queryFn: () => estudanteApi.getEstatisticasPorDisciplina(estudanteId),
  });

  // Consulta para obter evolução de desempenho
  const {
    data: evolucaoResponse,
    isLoading: evolucaoLoading,
    isError: evolucaoError,
    error: evolucaoErrorData,
  } = useQuery<ApiResponse<EvolucaoDesempenho>>({
    queryKey: ["evolucao-desempenho", estudanteId],
    queryFn: () => estudanteApi.getEvolucaoDesempenho(estudanteId),
  });

  return {
    estatisticas: estatisticasResponse?.data,
    disciplinas: disciplinasResponse?.data || [],
    evolucao: evolucaoResponse?.data,
    isLoading: estatisticasLoading || disciplinasLoading || evolucaoLoading,
    isError: estatisticasError || disciplinasError || evolucaoError,
    errors: {
      estatisticas: estatisticasErrorData,
      disciplinas: disciplinasErrorData,
      evolucao: evolucaoErrorData,
    },
  };
}


