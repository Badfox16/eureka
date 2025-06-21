import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import * as quizRespostaApi from "@/api/quizResposta";
import { EstudanteQuiz } from "@/types/estudanteQuiz";
import { QuizResposta } from "@/types/quizResposta";
import { ApiResponse } from "@/types/api";

export function useQuizResposta(estudanteQuizId?: string) {
  const queryClient = useQueryClient();
  // Consulta para obter detalhes de um quiz em andamento
  const {
    data: tentativaAtual,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ApiResponse<EstudanteQuiz> | undefined>({
    queryKey: ["tentativa", estudanteQuizId],
    queryFn: async () => {
      if (!estudanteQuizId) return undefined;
      return await quizRespostaApi.getQuizEmAndamento(estudanteQuizId);
    },
    enabled: !!estudanteQuizId, // Só executa se houver um ID de tentativa
    retry: false,
  });
  // Mutação para iniciar uma tentativa
  const iniciarMutation = useMutation({
    mutationFn: (quizId: string) => quizRespostaApi.iniciarQuiz(quizId),
    onSuccess: (response: ApiResponse<EstudanteQuiz>) => {
      if (response.data) {
        queryClient.setQueryData(["tentativa", response.data._id], response);
      }
    },
  });
  // Mutação para registrar uma resposta
  const responderMutation = useMutation({
    mutationFn: ({ 
      questaoId, 
      opcaoSelecionadaId, 
      respostaTexto 
    }: { 
      questaoId: string;
      opcaoSelecionadaId?: string;
      respostaTexto?: string;
    }) => {
      if (!estudanteQuizId) {
        throw new Error("Nenhuma tentativa em andamento");
      }
      return quizRespostaApi.registrarResposta(
        estudanteQuizId, 
        questaoId, 
        { opcaoSelecionadaId, respostaTexto }
      );
    },
    onSuccess: () => {
      // Recarrega a tentativa atual após registrar uma resposta
      if (estudanteQuizId) {
        refetch();
      }
    },
  });
  // Mutação para finalizar uma tentativa
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
        // Invalidar a lista de tentativas para atualizar histórico
        queryClient.invalidateQueries({
          queryKey: ["tentativas"],
        });
      }
    },
  });

  // Função para iniciar uma tentativa
  const iniciarQuiz = useCallback(
    (quizId: string) => iniciarMutation.mutateAsync(quizId),
    [iniciarMutation]
  );

  // Função para registrar uma resposta
  const responderQuestao = useCallback(
    (
      questaoId: string,
      dados: { opcaoSelecionadaId?: string; respostaTexto?: string }
    ) =>
      responderMutation.mutateAsync({
        questaoId,
        ...dados,
      }),
    [responderMutation]
  );

  // Função para finalizar uma tentativa
  const finalizarQuiz = useCallback(
    () => finalizarMutation.mutateAsync(),
    [finalizarMutation]
  );
  return {
    tentativaAtual: tentativaAtual?.data,
    isLoading,
    isError,
    error,
    iniciarQuiz,
    responderQuestao,
    finalizarQuiz,
    refetch,
  };
}
