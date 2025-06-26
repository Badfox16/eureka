import { EstudanteQuiz } from "./estudanteQuiz";
import { Questao } from "./questao";

// Modelo de resposta de quiz
export type QuizResposta = {
  _id: string;
  estudanteQuiz: string | EstudanteQuiz;
  questao: string | Questao;
  respostaEscolhida: string;
  estaCorreta: boolean;
  tempoResposta?: number;
  pontuacaoObtida: number;
  createdAt: string;
  updatedAt: string;
};

// Tipos para operações com resposta de quiz
export type CreateQuizRespostaInput = {
  estudanteQuiz: string;
  questao: string;
  respostaEscolhida: string;
  estaCorreta?: boolean;
  tempoResposta?: number;
  pontuacaoObtida?: number;
};

export type UpdateQuizRespostaInput = Partial<CreateQuizRespostaInput>;

// Esquema para iniciar um quiz
export type IniciarQuizInput = {
  estudanteId: string;
  quizId: string;
};

// Esquema para registrar uma resposta
export type RegistrarRespostaInput = {
  estudanteQuizId: string;
  questaoId: string;
  respostaEscolhida: string;
  tempoResposta?: number;
};

// Tipo específico para resposta de iniciar quiz (baseado no backend)
export type IniciarQuizResponse = {
  tentativa: EstudanteQuiz;
  questoes?: Questao[];
  totalQuestoes: number;
  questoesPendentes?: Questao[];
  totalRespondidas?: number;
};

// Tipo para resposta de quiz em andamento (baseado no backend)
export type QuizEmAndamentoResponse = {
  quiz: {
    id: string;
    titulo: string;
    descricao?: string;
    avaliacao: {
      id: string;
      tipo: string;
      classe: number;
      ano: number;
    };
    disciplina: {
      id: string;
      nome: string;
      codigo: string;
    };
    tempoLimite?: number;
  };
  tentativa: {
    id: string;
    estudante: {
      id: string;
      nome: string;
    };
    dataInicio: string;
    tempo: {
      decorrido: number;
      restante: number | null;
      excedido: boolean;
      limiteEmMinutos?: number;
    };
  };
  progresso: {
    respondidas: number;
    total: number;
    pendentes: number;
    percentualConcluido: number;
  };
  questoesPendentes: Questao[];
  questoesRespondidas: {
    id: string;
    numero: number;
    respostaEscolhida: string;
    estaCorreta: boolean;
  }[];
};
