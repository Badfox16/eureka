import { z } from 'zod';
import { BaseModel } from './base';
import { Estudante } from './estudante';
import {
  createEstudanteQuizSchema,
  updateEstudanteQuizSchema,
  estudanteQuizSchema
} from '../schemas/estudanteQuiz.schema';

// Tipos derivados dos schemas
export type CreateEstudanteQuizInput = z.infer<typeof createEstudanteQuizSchema>;
export type UpdateEstudanteQuizInput = z.infer<typeof updateEstudanteQuizSchema>;
export type EstudanteQuizModel = z.infer<typeof estudanteQuizSchema>;

// Interfaces adicionais específicas para a UI
export interface EstudanteQuiz extends BaseModel {
  estudante: string | Estudante;
  quiz: string;
  dataInicio: Date;
  dataFim?: Date;
  pontuacaoObtida?: number;
  totalPontos?: number;
  respostasCorretas: number;
  totalQuestoes: number;
  percentualAcerto: number;
}

export interface EstudanteQuizTableItem {
  id: string | number;
  estudanteNome: string;
  quizTitulo: string;
  dataInicio: string;
  dataFim?: string;
  pontuacaoObtida?: number;
  totalPontos?: number;
  percentualAcerto: number;
  status: 'completo' | 'em_andamento';
}

export interface EstudanteQuizForm {
  estudante: string;
  quiz: string;
  dataInicio?: Date;
  dataFim?: Date;
  pontuacaoObtida?: number;
  totalPontos?: number;
  respostasCorretas?: number;
  totalQuestoes?: number;
}