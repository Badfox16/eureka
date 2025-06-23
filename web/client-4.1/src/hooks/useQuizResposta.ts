import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import * as quizRespostaApi from "@/api/quizResposta";
import { EstudanteQuiz } from "@/types/estudanteQuiz";
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
  } = useQuery<ApiResponse<EstudanteQuiz> | undefined>({    queryKey: ["tentativa", estudanteQuizId, isResultado ? "resultado" : "andamento"],
    queryFn: async () => {
      if (!estudanteQuizId) {
        console.log('❌ useQuizResposta: estudanteQuizId não fornecido');
        return undefined;
      }
      
      console.log(`🔍 useQuizResposta: Buscando ${isResultado ? 'resultado' : 'andamento'} para ID:`, estudanteQuizId);
      
      // Se é para buscar resultado, usa API diferente
      if (isResultado) {
        try {
          console.log('📋 Tentando buscar resultado via API /quiz-respostas/' + estudanteQuizId);
          const result = await quizRespostaApi.getResultadoQuiz(estudanteQuizId);
          console.log('✅ Resultado obtido com sucesso:', result);
          return result;
        } catch (error) {
          console.error('❌ Erro ao buscar resultado via API principal:', error);
          console.log('🔄 Tentando fallback para API de andamento...');
          
          try {
            const fallbackResult = await quizRespostaApi.getQuizEmAndamento(estudanteQuizId);
            console.log('✅ Resultado obtido via fallback:', fallbackResult);
            return fallbackResult;
          } catch (fallbackError) {
            console.error('❌ Erro também no fallback:', fallbackError);
            throw new Error(`Não foi possível buscar dados do quiz. Erro principal: ${error instanceof Error ? error.message : 'Desconhecido'}. Erro fallback: ${fallbackError instanceof Error ? fallbackError.message : 'Desconhecido'}`);
          }
        }
      } else {
        console.log('📋 Buscando andamento via API /quiz-respostas/' + estudanteQuizId + '/andamento');
        try {
          const result = await quizRespostaApi.getQuizEmAndamento(estudanteQuizId);
          console.log('✅ Andamento obtido com sucesso:', result);
          return result;
        } catch (error) {
          console.error('❌ Erro ao buscar andamento:', error);
          throw error;
        }
      }
    },
    enabled: !!estudanteQuizId,
    retry: false,
  });const iniciarMutation = useMutation({
    mutationFn: async (quizId: string) => {
      if (!usuario) {
        throw new Error("Usuário não autenticado");
      }
      
      console.log('=== DEBUG: Iniciando quiz ===');
      console.log('Usuario completo:', usuario);
      console.log('QuizId:', quizId);
      console.log('localStorage user_data:', localStorage.getItem('user_data'));
      console.log('localStorage auth_token exists:', !!localStorage.getItem('auth_token'));
      
      try {
        const response = await quizRespostaApi.iniciarQuiz(quizId);
        console.log('=== DEBUG: Resposta do iniciarQuiz ===');
        console.log('Response completa:', response);
        console.log('Response.data:', response.data);
        console.log('=====================================');
        return response;
      } catch (error) {
        console.error('=== DEBUG: Erro no iniciarQuiz ===');
        console.error('Erro completo:', error);
        console.error('Tipo do erro:', typeof error);
        if (error && typeof error === 'object') {
          console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
        }
        console.error('===================================');
        throw error;
      }
    },
    onSuccess: (response: ApiResponse<any>) => {
      console.log('Quiz iniciado com sucesso:', response);
      if (response.data) {
        const tentativaId = response.data.tentativa?._id || response.data._id;
        if (tentativaId) {
          queryClient.setQueryData(["tentativa", tentativaId], response);
        } else {
          console.warn('Resposta de sucesso, mas sem ID da tentativa:', response);
        }
      } else {
        console.warn('Resposta de sucesso, mas sem dados:', response);
      }
    },
    onError: (error) => {
      console.error('Erro ao iniciar quiz no hook:', error);
      // Tentar extrair mais informações do erro
      if (error && typeof error === 'object') {
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
      }
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
