import { Avaliacao } from "./avaliacao";
import { Questao } from "./questao";

// Tipo para alternativa de questão
export type AlternativaQuiz = {
  _id: string;
  letra: string;
  texto: string;
  correta: boolean;
};

// Modelo de questão adaptada para o quiz
export type QuestaoQuiz = {
  _id: string;
  numero: number;
  enunciado: string;
  alternativas: AlternativaQuiz[];
  explicacao: string;
  valor: number;
};

// Modelo de quiz
export type Quiz = {
  _id: string;
  titulo: string;
  descricao?: string;
  avaliacao: {
    _id: string;
    tipo: string;
    ano: number;
    disciplina: {
      _id: string;
      nome: string;
      codigo: string;
      descricao: string;
      ativo: boolean;
    };
    questoes: {
      _id: string;
      numero: number;
      enunciado: string;
      alternativas: {
        _id: string;
        letra: string;
        texto: string;
        correta: boolean;
      }[];
      explicacao: string;
      valor: number;
    }[];
    trimestre: string;
    provincia: string;
    variante: string;
    areaEstudo: string;
    classe: number;
    ativo: boolean;
  };
  tempoLimite: number;
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
