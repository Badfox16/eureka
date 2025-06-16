import { z } from 'zod';
import { BaseModel } from './base';
import { Avaliacao } from './avaliacao';
import { Disciplina } from './disciplina';
import {
  alternativaSchema,
  createQuestaoSchema,
  updateQuestaoSchema,
  questaoSchema
} from '../schemas/questao.schema';

// Tipos derivados dos schemas
export type Alternativa = z.infer<typeof alternativaSchema>;
export type CreateQuestaoInput = z.infer<typeof createQuestaoSchema>;
export type UpdateQuestaoInput = z.infer<typeof updateQuestaoSchema>;
export type QuestaoModel = z.infer<typeof questaoSchema>;

// Interfaces adicionais específicas para a UI
export interface Questao extends BaseModel {
  numero?: number;          
  valor?: number;  
  enunciado: string;
  alternativas: Alternativa[];
  disciplina: string | Disciplina;
  avaliacao?: string | Avaliacao;
  dificuldade?: string;
  tempoEstimado?: number; // em segundos
}

export interface QuestaoForm {
  numero: number;
  enunciado: string;
  alternativas: {
    letra: string;
    texto: string;
    correta: boolean;
  }[];
  explicacao?: string;
  imagemEnunciadoUrl?: string;
  imagemUrl?: string;
  avaliacao: string;
  valor?: number;
}

export interface QuestaoTableItem {
  id: string | number;
  numero: number;
  enunciado: string;
  avaliacaoTitulo: string;
  alternativasCount: number;
  valor: number;
  dataCriacao: string;
}