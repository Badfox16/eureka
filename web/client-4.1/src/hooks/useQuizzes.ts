import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import * as quizApi from "@/api/quiz.refatorado";
import { Quiz } from "@/types/quiz";
import { QuizSearchParams } from "@/types/search";

export function useQuizzes(params?: QuizSearchParams) {
  // Valor padrão para os parâmetros de busca
  const defaultParams: QuizSearchParams = {
    page: 1,
    limit: 10,
    ...params,
  };

  // Consulta para obter quizzes
  const {
    data: resultado,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["quizzes", defaultParams],
    queryFn: async () => {
      const response = await quizApi.getQuizzes(defaultParams);
      return {
        quizzes: response.data || [],
        pagination: response.pagination,
      };
    },
  });

  return {
    quizzes: resultado?.quizzes || [],
    pagination: resultado?.pagination,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useQuiz(quizId?: string) {
  const queryClient = useQueryClient();

  // Consulta para obter um quiz específico
  const {
    data: quiz,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Quiz | undefined>({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      if (!quizId) return undefined;
      const response = await quizApi.getQuiz(quizId);
      return response.data;
    },
    enabled: !!quizId,
  });

  // Mutação para atualizar um quiz
  const updateMutation = useMutation({
    mutationFn: (data: {
      id: string;
      quizData: Partial<{
        titulo: string;
        descricao?: string;
        avaliacao: string;
        tempoLimite?: number;
        ativo?: boolean;
      }>;
    }) => quizApi.updateQuiz(data.id, data.quizData),
    onSuccess: (response) => {
      if (response.data && quizId) {
        queryClient.setQueryData(["quiz", quizId], response.data);
      }
    },
  });

  // Mutação para alternar o status de um quiz
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => quizApi.toggleQuizStatus(id),
    onSuccess: (response) => {
      if (response.data && quizId) {
        queryClient.setQueryData(["quiz", quizId], response.data);
      }
    },
  });

  // Função para atualizar um quiz
  const updateQuiz = useCallback(
    (quizData: Partial<{
      titulo: string;
      descricao?: string;
      avaliacao: string;
      tempoLimite?: number;
      ativo?: boolean;
    }>) => {
      if (!quizId) throw new Error("Quiz ID é necessário");
      return updateMutation.mutateAsync({ id: quizId, quizData });
    },
    [quizId, updateMutation]
  );

  // Função para alternar o status de um quiz
  const toggleStatus = useCallback(() => {
    if (!quizId) throw new Error("Quiz ID é necessário");
    return toggleStatusMutation.mutateAsync(quizId);
  }, [quizId, toggleStatusMutation]);

  return {
    quiz,
    isLoading,
    isError,
    error,
    refetch,
    updateQuiz,
    toggleStatus,
  };
}
