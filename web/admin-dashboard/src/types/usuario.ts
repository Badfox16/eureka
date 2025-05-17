import { z } from 'zod';
import { BaseModel, TipoUsuario } from './base';
import { 
  createUsuarioSchema, 
  updateUsuarioSchema, 
  usuarioSchema 
} from '../schemas/usuario.schema';

// Tipos derivados dos schemas
export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
export type UsuarioModel = z.infer<typeof usuarioSchema>;

// Interfaces adicionais específicas para a UI
export interface Usuario extends BaseModel {
  nome: string;
  email: string;
  tipo: TipoUsuario;
}

export interface UsuarioForm {
  nome: string;
  email: string;
  senha?: string; // Opcional ao editar
  tipo: TipoUsuario;
}

export interface UsuarioTableItem {
  id: string | number;
  nome: string;
  email: string;
  tipo: string;
  status: string;
  dataCriacao: string;
}