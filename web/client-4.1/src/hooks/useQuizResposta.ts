import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import * as quizRespostaApi from "@/api/quizResposta";
import { EstudanteQuiz, QuizResultadoDetalhado } from "@/types/estudanteQuiz";
import { QuizResposta, IniciarQuizResponse } from "@/types/quizResposta";
import { ApiResponse } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";

export function useQuizResposta(estudanteQuizId?: string, isResultado: boolean = false) {
  const queryClient = useQueryClient();
  const { usuario } = useAuth();
  const { 
    data: tentativaAtual, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery<ApiResponse<QuizResultadoDetalhado | EstudanteQuiz> | undefined>({
    queryKey: ["tentativa", estudanteQuizId, isResultado ? "resultado" : "andamento"],
    queryFn: async () => {
      if (!estudanteQuizId) {
        return undefined;
      }
      
      // Se é para buscar resultado, usa API diferente
      if (isResultado) {
        return await quizRespostaApi.getResultadoQuiz(estudanteQuizId);
      } else {
        return await quizRespostaApi.getQuizEmAndamento(estudanteQuizId);
      }
    },
    enabled: !!estudanteQuizId,
    retry: false,
  });const iniciarMutation = useMutation({
    mutationFn: async (quizId: string) => {
      if (!usuario) {
        throw new Error("Usuário não autenticado");
      }
        try {
        const response = await quizRespostaApi.iniciarQuiz(quizId);
        return response;
      } catch (error) {
        throw error;
      }
    },    onSuccess: (response: ApiResponse<any>) => {
      if (response.data) {
        const tentativaId = response.data.tentativa?._id || response.data._id;
        if (tentativaId) {
          queryClient.setQueryData(["tentativa", tentativaId], response);
        }
      }
    },
    onError: (error) => {
      // Tratamento de erro silencioso ou logging mínimo
    }
  });

  const finalizarMutation = useMutation({
    mutationFn: () => {
      if (!estudanteQuizId) {
        throw new Error("Nenhuma tentativa em andamento");
      }
      return quizRespostaApi.finalizarQuiz(estudanteQuizId);
    },
    onSuccess: (response: ApiResponse<EstudanteQuiz>) => {
      if (response.data && estudanteQuizId) {
        queryClient.setQueryData(["tentativa", estudanteQuizId], response);
        queryClient.invalidateQueries({ queryKey: ["tentativas"] });
      }
    },
  });

  const submeterRespostasMutation = useMutation({
    mutationFn: (dados: {
      respostas: { questao: string; alternativaSelecionada: string; tempoResposta: number }[];
      tempoTotal: number;
    }) => {
      if (!estudanteQuizId) {
        throw new Error("Nenhuma tentativa em andamento para submeter.");
      }
      return quizRespostaApi.submeterRespostas(estudanteQuizId, dados.respostas, dados.tempoTotal);
    },
    onSuccess: (response: ApiResponse<EstudanteQuiz>) => {
      if (response.data && estudanteQuizId) {
        queryClient.setQueryData(["tentativa", estudanteQuizId], response);
        queryClient.invalidateQueries({ queryKey: ["tentativas"] });
      }
    },
  });

  const iniciarQuiz = useCallback(
    (quizId: string) => iniciarMutation.mutateAsync(quizId),
    [iniciarMutation]
  );

  const finalizarQuiz = useCallback(
    () => finalizarMutation.mutateAsync(),
    [finalizarMutation]
  );

  const submeterRespostas = useCallback(
    (respostas: { questao: string; alternativaSelecionada: string; tempoResposta: number }[], tempoTotal: number) =>
      submeterRespostasMutation.mutateAsync({ respostas, tempoTotal }),
    [submeterRespostasMutation]
  );

  return {
    tentativaAtual: tentativaAtual?.data,
    isLoading,
    isError,
    error,
    refetch,
    iniciarQuiz,
    finalizarQuiz,
    submeterRespostas,
    isStarting: iniciarMutation.isPending,
    isFinishing: finalizarMutation.isPending,
    isSubmitting: submeterRespostasMutation.isPending,
  };
}
