import { 
  EstatisticaDisciplina, 
  EvolucaoDesempenho, 
  RankingEstudante, 
  EstatisticasEstudante,
  EstatisticasGerais 
} from "@/types/estatisticas";
import { fetchApi, createAuthHeaders } from "./apiService";

// Função para obter estatísticas gerais de um estudante
export async function getEstatisticasEstudante(estudanteId: string) {
  return fetchApi<{ data: EstatisticasEstudante }>(`/estatisticas/estudantes/${estudanteId}/estatisticas`, {
    headers: createAuthHeaders(),
  });
}

// Função para obter estatísticas por disciplina
export async function getEstatisticasPorDisciplina(estudanteId: string) {
  return fetchApi<{ data: EstatisticaDisciplina[] }>(`/estudantes/${estudanteId}/estatisticas/disciplinas`, {
    headers: createAuthHeaders(),
  });
}

// Função para obter evolução de desempenho
export async function getEvolucaoDesempenho(estudanteId: string) {
  return fetchApi<{ data: EvolucaoDesempenho }>(`/estudantes/${estudanteId}/estatisticas/evolucao`, {
    headers: createAuthHeaders(),
  });
}

// Função para obter ranking geral
export async function getRanking(quizId?: string) {
  const endpoint = quizId 
    ? `/estatisticas/quizzes/${quizId}/ranking` 
    : '/estatisticas/ranking';
      return fetchApi<{ data: RankingEstudante[] }>(endpoint, {
    headers: createAuthHeaders(),
  });
}

// Função para obter estatísticas gerais do sistema
export async function getEstatisticasGerais() {
  return fetchApi<{ data: EstatisticasGerais }>(`/estatisticas/gerais`, {
    headers: createAuthHeaders(),
  });
}
