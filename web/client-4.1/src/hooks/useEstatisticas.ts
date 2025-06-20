import { useQuery } from "@tanstack/react-query";
import * as estatisticaApi from "@/api/estatistica";
import { Estatistica, EstatisticaDisciplina, EvolucaoDesempenho, RankingEstudante } from "@/types/estatisticas";

export function useEstatisticas(estudanteId?: string) {
  // Consulta para obter estatísticas gerais
  const estatisticasGerais = useQuery<Estatistica | undefined>({
    queryKey: ["estatisticas", "estudante", estudanteId],
    queryFn: async () => {
      if (!estudanteId) return undefined;
      const response = await estatisticaApi.getEstatisticasEstudante(estudanteId);
      return response.data;
    },
    enabled: !!estudanteId,
  });

  // Consulta para obter estatísticas por disciplina
  const estatisticasDisciplinas = useQuery<EstatisticaDisciplina[] | undefined>({
    queryKey: ["estatisticas", "disciplinas", estudanteId],
    queryFn: async () => {
      if (!estudanteId) return undefined;
      const response = await estatisticaApi.getEstatisticasPorDisciplina(estudanteId);
      return response.data;
    },
    enabled: !!estudanteId,
  });

  // Consulta para obter evolução de desempenho
  const evolucaoDesempenho = useQuery<EvolucaoDesempenho | undefined>({
    queryKey: ["estatisticas", "evolucao", estudanteId],
    queryFn: async () => {
      if (!estudanteId) return undefined;
      const response = await estatisticaApi.getEvolucaoDesempenho(estudanteId);
      return response.data;
    },
    enabled: !!estudanteId,
  });

  return {
    estatisticasGerais: {
      data: estatisticasGerais.data,
      isLoading: estatisticasGerais.isLoading,
      isError: estatisticasGerais.isError,
      error: estatisticasGerais.error,
    },
    estatisticasDisciplinas: {
      data: estatisticasDisciplinas.data,
      isLoading: estatisticasDisciplinas.isLoading,
      isError: estatisticasDisciplinas.isError,
      error: estatisticasDisciplinas.error,
    },
    evolucaoDesempenho: {
      data: evolucaoDesempenho.data,
      isLoading: evolucaoDesempenho.isLoading,
      isError: evolucaoDesempenho.isError,
      error: evolucaoDesempenho.error,
    },
  };
}

export function useRanking(quizId?: string) {
  const ranking = useQuery<RankingEstudante[] | undefined>({
    queryKey: ["ranking", quizId],
    queryFn: async () => {
      const response = await estatisticaApi.getRanking(quizId);
      return response.data;
    },
  });

  return {
    data: ranking.data,
    isLoading: ranking.isLoading,
    isError: ranking.isError,
    error: ranking.error,
  };
}
