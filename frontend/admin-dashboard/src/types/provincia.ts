import { BaseModel } from './base';

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