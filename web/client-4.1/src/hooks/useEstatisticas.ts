import { useQuery } from "@tanstack/react-query";
import * as estatisticaApi from "@/api/estatistica";
import * as estudanteApi from "@/api/estudante";
import { 
  EstatisticaDisciplina, 
  EvolucaoDesempenho, 
  RankingEstudante,
  EstatisticasEstudante 
} from "@/types/estatisticas";

export function useEstatisticas(estudanteId?: string) {
  // Consulta para obter estatísticas gerais do estudante
  const estatisticasGerais = useQuery<EstatisticasEstudante | null>({
    queryKey: ["estatisticas", "estudante", estudanteId],
    queryFn: async () => {
      if (!estudanteId) return null;
      const response = await estudanteApi.getEstatisticasEstudante(estudanteId);
      return response.data || null;
    },
    enabled: !!estudanteId,
  });

  // Consulta para obter estatísticas por disciplina
  const estatisticasDisciplinas = useQuery<EstatisticaDisciplina[] | null>({
    queryKey: ["estatisticas", "disciplinas", estudanteId],
    queryFn: async () => {
      if (!estudanteId) return null;
      const response = await estudanteApi.getEstatisticasPorDisciplina(estudanteId);
      return response.data || null;
    },
    enabled: !!estudanteId,
  });

  // Consulta para obter evolução de desempenho
  const evolucaoDesempenho = useQuery<EvolucaoDesempenho | null>({
    queryKey: ["estatisticas", "evolucao", estudanteId],
    queryFn: async () => {
      if (!estudanteId) return null;
      const response = await estudanteApi.getEvolucaoDesempenho(estudanteId);
      return response.data || null;
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

export function useRanking(quizId?: string) {  const ranking = useQuery<RankingEstudante[] | null>({
    queryKey: ["ranking", quizId],
    queryFn: async () => {
      const response = await estatisticaApi.getRanking(quizId);
      return response.data || null;
    },
  });

  return {
    data: ranking.data,
    isLoading: ranking.isLoading,
    isError: ranking.isError,
    error: ranking.error,
  };
}
