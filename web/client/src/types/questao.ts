import { Avaliacao } from "./avaliacao";

// Modelo de alternativa
export type Alternativa = {
  letra: string;
  texto: string;
  correta: boolean;
  imagemUrl?: string;
};

// Modelo de questão
export type Questao = {
  _id: string;
  numero: number;
  enunciado: string;
  alternativas: Alternativa[];
  explicacao?: string;
  imagemEnunciadoUrl?: string;
  imagemUrl?: string;
  avaliacao: string | Avaliacao;
  valor: number;
  createdAt: string;
  updatedAt: string;
};

// Tipos para operações com questão
export type CreateQuestaoInput = {
  numero: number;
  enunciado: string;
  alternativas: Alternativa[];
  explicacao?: string;
  imagemEnunciadoUrl?: string;
  imagemUrl?: string;
  avaliacao: string;
  valor?: number;
};

export type UpdateQuestaoInput = Partial<CreateQuestaoInput>;

// Tipo para filtros de busca de questões
export type QuestaoSearchParams = {
  page: number;
  limit: number;
  search?: string;
  disciplina?: string;
  avaliacaoId?: string;
  notInAvaliacao?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
