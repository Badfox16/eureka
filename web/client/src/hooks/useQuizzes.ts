import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import * as quizApi from "@/api/quiz";
import { Quiz } from "@/types/quiz";
import { QuizSearchParams } from "@/types/search";
import { ApiResponse } from "@/types/api";

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
  
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => {
      if (!quizId) return null;
      const response = await quizApi.getQuiz(quizId);
      console.log('Quiz response:', response); // Log para debug
      return response;
    },
    enabled: !!quizId,
  });

  // Transformar os dados para manter a compatibilidade com o código existente
  const quiz = data?.data ? {
    ...data.data,
    questoes: data.data.avaliacao?.questoes || []
  } : null;

  return {
    quiz,
    isLoading,
    isError,
    error,
    refetch,
  };
}
