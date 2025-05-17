import { BaseModel } from './base';
import { Estudante } from './estudante';
import { Questao } from './questao';

export interface Resposta extends BaseModel {
  estudante: string | Estudante;
  questao: string | Questao;
  alternativaSelecionada: string;
  estaCorreta: boolean;
  tempoResposta?: number; // em segundos
}