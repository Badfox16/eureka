import { BaseModel, TipoUsuario } from './base';

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