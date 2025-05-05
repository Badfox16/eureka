import { Avaliacao } from './avaliacao';
import { BaseModel } from './base';
import { Disciplina } from './disciplina';

export interface Alternativa {
  id: string;
  texto: string;
  isCorreta: boolean;
}

export interface Questao extends BaseModel {
  enunciado: string;
  alternativas: Alternativa[];
  disciplina: string | Disciplina;
  avaliacao?: string | Avaliacao;
  dificuldade?: string;
  tempoEstimado?: number; // em segundos
}