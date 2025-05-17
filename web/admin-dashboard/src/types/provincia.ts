import { z } from 'zod';
import { BaseModel } from './base';
import {
  createProvinciaSchema,
  updateProvinciaSchema,
  provinciaSchema
} from '../schemas/provincia.schema';

// Tipos derivados dos schemas
export type CreateProvinciaInput = z.infer<typeof createProvinciaSchema>;
export type UpdateProvinciaInput = z.infer<typeof updateProvinciaSchema>;
export type ProvinciaModel = z.infer<typeof provinciaSchema>;

export interface Provincia extends BaseModel {
  nome: string;
  codigo: string;
  regiao: string;
}

export interface ProvinciaForm {
  nome: string;
  codigo: string;
  regiao: string;
}

export interface ProvinciaTableItem {
  id: string | number;
  nome: string;
  codigo: string;
  regiao: string;
  // dataCriacao: string;
}