import { z } from 'zod';
import { BaseModel } from './base';
import { Avaliacao } from './avaliacao';
import {
  createQuizSchema,
  updateQuizSchema,
  quizSchema
} from '../schemas/quiz.schema';

// Tipos derivados dos schemas
export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>;
export type QuizModel = z.infer<typeof quizSchema>;

// Interfaces adicionais específicas para a UI
export interface Quiz extends BaseModel {
  titulo: string;
  descricao?: string;
  avaliacao: string | Avaliacao;
  tempoLimite?: number;
  ativo: boolean;
}

export interface QuizForm {
  titulo: string;
  descricao?: string;
  avaliacao: string;
  tempoLimite?: number;
  ativo: boolean;
}

export interface QuizTableItem {
  id: string | number;
  titulo: string;
  avaliacaoTitulo: string;
  tempoLimite?: string;
  ativo: boolean;
  dataCriacao: string;
}