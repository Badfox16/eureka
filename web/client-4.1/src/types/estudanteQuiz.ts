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
