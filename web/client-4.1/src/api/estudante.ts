import { Estudante } from "@/types/estudante";
import { EstudanteQuiz } from "@/types/estudanteQuiz";
import { Estatistica, EstatisticaDisciplina, EvolucaoDesempenho } from "@/types/estatisticas";
import { EstudanteSearchParams } from "@/types/search";
import { fetchApi, buildQueryString, createAuthHeaders } from "./apiService";

// Função para listar estudantes com suporte a paginação e filtros
export async function getEstudantes(params: EstudanteSearchParams) {
  const queryString = buildQueryString(params);
  
  return fetchApi<Estudante[]>(`/estudantes${queryString}`, {
    headers: createAuthHeaders(),
  });
}

// Função para obter um estudante específico
export async function getEstudante(id: string) {
  return fetchApi<Estudante>(`/estudantes/${id}`, {
    headers: createAuthHeaders(),
  });
}

// Função para obter o perfil do estudante atual
export async function getPerfilEstudante() {
  return fetchApi<Estudante>(`/estudantes/me`, {
    headers: createAuthHeaders(),
  });
}

// Função para obter quizzes realizados por um estudante
export async function getQuizzesEstudante(id: string, params?: { page: number; limit: number }) {
  const queryString = params ? buildQueryString(params) : '';
  
  return fetchApi<EstudanteQuiz[]>(`/estudantes/${id}/quizzes${queryString}`, {
    headers: createAuthHeaders(),
  });
}

// Função para obter estatísticas de um estudante
export async function getEstatisticasEstudante(id: string) {
  return fetchApi<Estatistica>(`/estatisticas/estudantes/${id}/estatisticas`, {
    headers: createAuthHeaders(),
  });
}

// Função para obter estatísticas por disciplina
export async function getEstatisticasPorDisciplina(id: string) {
  return fetchApi<EstatisticaDisciplina[]>(`/estudantes/${id}/estatisticas/disciplinas`, {
    headers: createAuthHeaders(),
  });
}

// Função para obter evolução de desempenho
export async function getEvolucaoDesempenho(id: string) {
  return fetchApi<EvolucaoDesempenho>(`/estudantes/${id}/estatisticas/evolucao`, {
    headers: createAuthHeaders(),
  });
}

// Função para atualizar senha do estudante
export async function atualizarSenhaEstudante(senhaAtual: string, novaSenha: string) {
  return fetchApi<{ success: boolean }>(`/estudantes/me/alterar-senha`, {
    method: 'POST',
    body: JSON.stringify({ senhaAtual, novaSenha }),
    headers: createAuthHeaders(),
  });
}
