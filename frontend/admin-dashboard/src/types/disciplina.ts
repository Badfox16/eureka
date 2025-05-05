import { BaseModel } from './base';

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