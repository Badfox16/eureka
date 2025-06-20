import { EstudanteQuiz } from "@/types/estudanteQuiz";
import { QuizResposta } from "@/types/quizResposta";
import { EstudanteQuizSearchParams } from "@/types/search";
import { fetchApi, buildQueryString } from "./apiService";

// Função para buscar todas as tentativas de quiz com filtros e paginação
export async function getTentativas(params: EstudanteQuizSearchParams) {
  const queryString = buildQueryString(params);
    return fetchApi<EstudanteQuiz[]>(`/estudantes/${params.estudanteId}/quizzes${queryString}`);
}

// Função para obter uma tentativa específica por ID
export async function getTentativa(id: string) {  return fetchApi<EstudanteQuiz>(`/quiz-respostas/${id}/andamento`);
}

// Função para obter detalhes de um quiz em andamento
export async function getQuizEmAndamento(estudanteQuizId: string) {  return fetchApi<EstudanteQuiz>(`/quiz-respostas/${estudanteQuizId}/andamento`);
}

// Função para iniciar uma nova tentativa de quiz
export async function iniciarQuiz(quizId: string) {  return fetchApi<EstudanteQuiz>('/quiz-respostas/iniciar', {
    method: 'POST',
    body: JSON.stringify({ quizId })
  });
}

// Função para registrar uma resposta a uma questão
export async function registrarResposta(
  estudanteQuizId: string, 
  questaoId: string, 
  data: { opcaoSelecionadaId?: string, respostaTexto?: string }
) {  return fetchApi<QuizResposta>('/quiz-respostas/resposta', {
    method: 'POST',
    body: JSON.stringify({
      estudanteQuizId,
      questaoId,
      ...data
    })
  });
}

// Função para finalizar um quiz
export async function finalizarQuiz(estudanteQuizId: string) {  return fetchApi<EstudanteQuiz>(`/quiz-respostas/${estudanteQuizId}/finalizar`, {
    method: 'POST'
  });
}
