import { z } from 'zod';
import { BaseModel } from './base';
import {
  createDisciplinaSchema,
  updateDisciplinaSchema,
  disciplinaSchema
} from '../schemas/disciplina.schema';

// Tipos derivados dos schemas
export type CreateDisciplinaInput = z.infer<typeof createDisciplinaSchema>;
export type UpdateDisciplinaInput = z.infer<typeof updateDisciplinaSchema>;
export type DisciplinaModel = z.infer<typeof disciplinaSchema>;

// Interfaces adicionais específicas para a UI
export interface Disciplina extends BaseModel {
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface DisciplinaForm {
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface DisciplinaTableItem {
  id: string | number;
  codigo: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  dataCriacao: string;
}