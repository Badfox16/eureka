import { EstudanteQuiz } from "@/types/estudanteQuiz";
import { QuizResposta } from "@/types/quizResposta";
import { EstudanteQuizSearchParams } from "@/types/search";
import { fetchApi, buildQueryString, createAuthHeaders } from "./apiService";

// Função para listar tentativas com suporte a paginação e filtros
export async function getTentativas(params: EstudanteQuizSearchParams) {
  const queryString = buildQueryString(params);
  
  return fetchApi<EstudanteQuiz[]>(`/estudantes/${params.estudanteId}/quizzes${queryString}`, {
    headers: createAuthHeaders(),
  });
}

// Função para obter uma tentativa específica
export async function getTentativa(id: string) {
  return fetchApi<EstudanteQuiz>(`/quiz-respostas/${id}/andamento`, {
    headers: createAuthHeaders(),
  });
}

// Função para iniciar uma nova tentativa
export async function iniciarQuiz(quizId: string) {
  return fetchApi<EstudanteQuiz>('/quiz-respostas/iniciar', {
    method: 'POST',
    body: JSON.stringify({ quizId }),
    headers: createAuthHeaders(),
  });
}

// Função para enviar resposta a uma questão
export async function registrarResposta(
  estudanteQuizId: string, 
  questaoId: string, 
  resposta: { opcaoSelecionadaId?: string; respostaTexto?: string }
) {
  return fetchApi<QuizResposta>(`/quiz-respostas/resposta`, {
    method: 'POST',
    body: JSON.stringify({
      estudanteQuizId,
      questaoId,
      ...resposta
    }),
    headers: createAuthHeaders(),
  });
}

// Função para finalizar uma tentativa
export async function finalizarQuiz(estudanteQuizId: string) {
  return fetchApi<EstudanteQuiz>(`/quiz-respostas/${estudanteQuizId}/finalizar`, {
    method: 'POST',
    headers: createAuthHeaders(),
  });
}
