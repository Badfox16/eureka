import { z } from 'zod';
import { BaseModel } from './base';
import { Provincia } from './provincia';
import { 
  createEstudanteSchema, 
  updateEstudanteSchema, 
  estudanteSchema 
} from '../schemas/estudante.schema';

// Tipos derivados dos schemas
export type CreateEstudanteInput = z.infer<typeof createEstudanteSchema>;
export type UpdateEstudanteInput = z.infer<typeof updateEstudanteSchema>;
export type EstudanteModel = z.infer<typeof estudanteSchema>;

// Interfaces adicionais específicas para a UI
export interface Estudante extends BaseModel {
  nome: string;
  email: string;
  classe: number;
  provincia?: string | Provincia;
}

export interface EstudanteForm {
  nome: string;
  email: string;
  classe: number;
  provincia?: string;
  escola?: string;
  password?: string; // Opcional ao editar
}

export interface EstudanteTableItem {
  id: string | number;
  nome: string;
  email: string;
  classe: number;
  provincia?: string;
  escola?: string;
  dataCriacao: string;
}