import { BaseModel } from './base';
import { z } from 'zod';
import {
  createDisciplinaSchema,
  updateDisciplinaSchema,
  disciplinaSchema
} from '../schemas/disciplina.schema';

// Tipos derivados dos schemas
export type CreateDisciplinaInput = z.infer<typeof createDisciplinaSchema>;
export type UpdateDisciplinaInput = z.infer<typeof updateDisciplinaSchema>;
export type DisciplinaModel = z.infer<typeof disciplinaSchema>;

export interface DisciplinaTableItem {
  id: string | number;
  nome: string;
  codigo: string;
  descricao?: string;
  // dataCriacao: string;
}

export interface Disciplina extends BaseModel {
  nome: string;
  codigo: string;
  descricao?: string;
}

export interface DisciplinaForm {
  nome: string;
  codigo: string;
  descricao?: string;
}