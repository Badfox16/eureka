import { Avaliacao } from "./avaliacao";
import { Questao } from "./questao";

// Modelo de opção de resposta para o quiz
export type OpcaoQuiz = {
  _id: string;
  texto: string;
  correta: boolean;
};

// Modelo de questão adaptada para o quiz
export type QuestaoQuiz = {
  _id: string;
  enunciado: string;
  opcoes: OpcaoQuiz[];
  explicacao?: string;
  imagem?: string;
};

// Modelo de quiz
export type Quiz = {
  _id: string;
  titulo: string;
  descricao?: string;
  avaliacao: string | Avaliacao;
  questoes: QuestaoQuiz[];
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
