import { Avaliacao } from "./avaliacao";

// Modelo de quiz
export type Quiz = {
  _id: string;
  titulo: string;
  descricao?: string;
  avaliacao: string | Avaliacao;
  tempoLimite?: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

// Tipos para operações com quiz
export type CreateQuizInput = {
  titulo: string;
  descricao?: string;
  avaliacao: string;
  tempoLimite?: number;
  ativo?: boolean;
};

export type UpdateQuizInput = Partial<CreateQuizInput>;

// Tipo para filtros de busca de quizzes
export type QuizSearchParams = {
  page: number;
  limit: number;
  search?: string;
  avaliacaoId?: string;
  disciplina?: string;
  ativo?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
