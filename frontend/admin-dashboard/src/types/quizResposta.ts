import { z } from 'zod';
import { BaseModel } from './base';
import { Estudante } from './estudante';
import { Questao } from './questao';
import { Quiz } from './quiz';
import {
  iniciarQuizSchema,
  registrarRespostaSchema
} from '../schemas/quizResposta.schema';

// Tipos derivados dos schemas
export type IniciarQuizInput = z.infer<typeof iniciarQuizSchema>['body'];
export type RegistrarRespostaInput = z.infer<typeof registrarRespostaSchema>['body'];

// Interfaces adicionais específicas para a UI
export interface QuizResposta extends BaseModel {
  estudante: string | Estudante;
  quiz: string | Quiz;
  questao: string | Questao;
  respostaEscolhida: string;
  correta: boolean;
  tempoResposta?: number; // em segundos
}

export interface QuizRespostaForm {
  estudanteQuizId: string;
  questaoId: string;
  respostaEscolhida: string;
  tempoResposta?: number;
}

export interface QuizRespostaTableItem {
  id: string | number;
  estudanteNome: string;
  quizTitulo: string;
  questaoNumero: number;
  respostaEscolhida: string;
  correta: boolean;
  tempoResposta?: string;
  dataCriacao: string;
}