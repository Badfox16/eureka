import { Estudante } from "./estudante";
import { Quiz } from "./quiz";

// Modelo de estudante-quiz (tentativa)
export type EstudanteQuiz = {
  _id: string;
  estudante: string | Estudante;
  quiz: string | Quiz;
  dataInicio: string;
  dataFim?: string;
  pontuacaoObtida?: number;
  totalPontos?: number;
  respostasCorretas: number;
  totalQuestoes: number;
  percentualAcerto: number;
  tempoTotal: number;
  acertos: number;
  respostas: Array<{
    questao: string;
    alternativa: string;
    correta: boolean;
    tempo: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

// Tipos para operações com estudante-quiz
export type CreateEstudanteQuizInput = {
  estudante: string;
  quiz: string;
  dataInicio?: Date;
  dataFim?: Date;
  pontuacaoObtida?: number;
  totalPontos?: number;
  respostasCorretas?: number;
  totalQuestoes?: number;
  percentualAcerto?: number;
};

export type UpdateEstudanteQuizInput = Partial<CreateEstudanteQuizInput>;

// Tipo para filtros de busca de estudante-quiz
export type EstudanteQuizSearchParams = {
  page: number;
  limit: number;
  estudanteId?: string;
  quizId?: string;
  dataInicio?: string;
  dataFim?: string;
  concluido?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

// Tipo específico para resultado detalhado de quiz finalizado
export type QuizResultadoDetalhado = {
  quiz: {
    id: string;
    titulo: string;
    descricao: string;
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
  };
  tentativa: {
    id: string;
    estudante: {
      id: string;
      nome: string;
    };
    dataInicio: string;
    dataFim: string;
    duracao: number;
    percentualAcerto: number;
    pontuacaoObtida: number;
    totalPontos: number;
    respostasCorretas: number;
    totalQuestoes: number;
  };
  respostas: Array<{
    questao: {
      id: string;
      numero: number;
      enunciado: string;
      imagemEnunciadoUrl?: string;
      valor: number;
    };
    resposta: {
      escolhida: string;
      estaCorreta: boolean;
      pontuacao: number;
      tempoResposta: number;
    };
    alternativas: Array<{
      letra: string;
      texto: string;
      correta: boolean;
      imagemUrl?: string;
    }>;
    alternativaEscolhida: {
      letra: string;
      texto: string;
      imagemUrl?: string;
    } | null;
    alternativaCorreta: {
      letra: string;
      texto: string;
      imagemUrl?: string;
    } | null;
    explicacao?: string;
  }>;
};
