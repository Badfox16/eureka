import { z } from 'zod';
import { BaseModel } from './base';
import {
  alternativaSchema,
  createQuestaoSchema,
  updateQuestaoSchema,
  questaoSchema,
  questaoPopuladaSchema,
  questaoQueryParamsSchema
} from '../schemas/questao.schema';

// Tipos derivados dos schemas
export type Alternativa = z.infer<typeof alternativaSchema>;
export type CreateQuestaoInput = z.infer<typeof createQuestaoSchema>;
export type UpdateQuestaoInput = z.infer<typeof updateQuestaoSchema>;
export type QuestaoModel = z.infer<typeof questaoSchema>;

// Interfaces adicionais específicas para a UI
export interface Questao extends BaseModel {
  _id: string;
  numero: number;
  enunciado: string;
  alternativas: {
    letra: string;
    texto: string;
    correta: boolean;
    _id: string;
  }[];
  explicacao?: string;
  avaliacao: string;
  valor: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
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


export {
  alternativaSchema,
  createQuestaoSchema,
  updateQuestaoSchema,
  questaoSchema,
  questaoPopuladaSchema,
  questaoQueryParamsSchema
};