import { EstudanteQuiz } from "@/types/estudanteQuiz";
import { QuizResposta } from "@/types/quizResposta";
import { EstudanteQuizSearchParams } from "@/types/search";
import { fetchApi, buildQueryString } from "./apiService";
import { ApiResponse, ApiResponsePaginated } from "@/types/api";

// Função para buscar todas as tentativas de quiz com filtros e paginação
export async function getTentativas(params: EstudanteQuizSearchParams) {
  const queryString = buildQueryString(params);
    return fetchApi<ApiResponsePaginated<EstudanteQuiz[]>>(`/estudantes/${params.estudanteId}/quizzes${queryString}`);
}

// Função para obter uma tentativa específica por ID
export async function getTentativa(id: string) {  
  return fetchApi<ApiResponse<EstudanteQuiz>>(`/quiz-respostas/${id}/andamento`);
}

// Função para obter detalhes de um quiz em andamento
export async function getQuizEmAndamento(estudanteQuizId: string) {  
  return fetchApi<ApiResponse<EstudanteQuiz>>(`/quiz-respostas/${estudanteQuizId}/andamento`);
}

// Função para obter resultado de um quiz finalizado
export async function getResultadoQuiz(estudanteQuizId: string) {  
  console.log('🔍 API getResultadoQuiz: Buscando resultado para ID:', estudanteQuizId);
  try {
    const result = await fetchApi<ApiResponse<EstudanteQuiz>>(`/quiz-respostas/${estudanteQuizId}`);
    console.log('✅ API getResultadoQuiz: Sucesso:', result);
    return result;
  } catch (error) {
    console.error('❌ API getResultadoQuiz: Erro:', error);
    throw error;
  }
}

// Função para iniciar uma nova tentativa de quiz
export async function iniciarQuiz(quizId: string) {
  console.log('Iniciando quiz com ID:', quizId);
    // Primeira estratégia: tentar obter estudanteId do localStorage
  let estudanteId = null;
  const userData = localStorage.getItem('user_data');
  
  if (userData) {
    try {
      const parsedData = JSON.parse(userData);
      console.log('Dados do usuário no localStorage:', parsedData);
      
      // Verificar se temos o estudanteId salvo diretamente
      if (parsedData.estudanteId) {
        estudanteId = parsedData.estudanteId;
        console.log('✅ estudanteId encontrado diretamente no localStorage:', estudanteId);
      } 
      // Verificar se temos dados do estudante salvos
      else if (parsedData.estudante && parsedData.estudante._id) {
        estudanteId = parsedData.estudante._id;
        console.log('✅ estudanteId encontrado nos dados do estudante no localStorage:', estudanteId);
      }
      // Se não encontrou, o _id salvo pode ser do usuário, não do estudante
      else {
        console.log('❌ Dados do localStorage não contêm estudanteId, apenas ID do usuário');
      }
    } catch (e) {
      console.warn('Erro ao parsear dados do usuário do localStorage:', e);
    }
  }
  // Segunda estratégia: buscar dados atuais do usuário via API
  if (!estudanteId) {
    console.warn('estudanteId não encontrado no localStorage, buscando via /auth/me...');
    try {
      const currentUserResponse = await fetchApi<{ status: string, data: { usuario: any, estudante?: any } }>('/auth/me');
      console.log('Resposta completa de /auth/me:', currentUserResponse);
      
      if (currentUserResponse.data) {
        console.log('Dados do /auth/me:', currentUserResponse.data);
        
        // Verificar se há um objeto estudante separado (que é o que precisamos!)
        if (currentUserResponse.data.estudante && currentUserResponse.data.estudante._id) {
          estudanteId = currentUserResponse.data.estudante._id;
          console.log('✅ estudanteId obtido do campo estudante separado:', estudanteId);
          
          // Salvar tanto os dados do usuário quanto do estudante
          if (currentUserResponse.data.usuario) {
            const dadosParaSalvar = {
              ...currentUserResponse.data.usuario,
              estudanteId: estudanteId, // Adicionar o estudanteId para fácil acesso
              estudante: currentUserResponse.data.estudante // Salvar dados completos do estudante
            };
            localStorage.setItem('user_data', JSON.stringify(dadosParaSalvar));
          }
        } else {
          console.error('❌ Usuário não é um estudante ou dados do estudante não encontrados');
          console.log('Tipo do usuário:', currentUserResponse.data.usuario?.tipo);
          throw new Error('Este usuário não é um estudante ou não tem dados de estudante associados');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário atual:', error);
      throw new Error('Não foi possível obter os dados do usuário para iniciar o quiz');
    }
  }

  if (!estudanteId) {
    throw new Error('Não foi possível identificar o estudante para iniciar o quiz');
  }
  const requestData = { quizId, estudanteId };
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.eureka.edu.br';
  const fullUrl = `${apiUrl}/api/v1/quiz-respostas/iniciar`;
  
  console.log('Dados para iniciar quiz:', requestData);
  console.log('URL completa da requisição:', fullUrl);
    try {
    const response = await fetchApi<ApiResponse<any>>('/quiz-respostas/iniciar', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    
    console.log('Resposta da API iniciarQuiz:', response);
    return response;
  } catch (error) {
    console.error('Erro detalhado ao iniciar quiz:', error);
    console.error('URL que falhou:', fullUrl);
    console.error('Request data que falhou:', requestData);
    throw error;
  }
}

// Função para registrar uma resposta a uma questão
export async function registrarResposta(
  estudanteQuizId: string, 
  questaoId: string, 
  data: { opcaoSelecionadaId?: string, respostaTexto?: string }
) {  
  return fetchApi<ApiResponse<QuizResposta>>('/quiz-respostas/resposta', {
    method: 'POST',
    body: JSON.stringify({
      estudanteQuizId,
      questaoId,
      ...data
    })
  });
}

// Função para finalizar um quiz
export async function finalizarQuiz(estudanteQuizId: string) {  
  return fetchApi<ApiResponse<EstudanteQuiz>>(`/quiz-respostas/${estudanteQuizId}/finalizar`, {
    method: 'POST'
  });
}

// Função para submeter todas as respostas de um quiz de uma vez
export async function submeterRespostas(
  estudanteQuizId: string,
  respostas: { questao: string; alternativaSelecionada: string; tempoResposta: number }[],
  tempoTotal: number
) {
  return fetchApi<ApiResponse<EstudanteQuiz>>(`/quiz-respostas/${estudanteQuizId}/submeter`, {
    method: 'POST',
    body: JSON.stringify({ respostas, tempoTotal }),
  });
}
