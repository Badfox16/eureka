import { BaseModel } from './base';
import { Disciplina } from './disciplina';
import { Provincia } from './provincia';
import { Questao } from './questao';
import { 
  createAvaliacaoSchema, 
  updateAvaliacaoSchema, 
  avaliacaoSchema 
} from '../schemas/avaliacao.schema';
import { z } from 'zod';

// Tipos derivados dos schemas
export type CreateAvaliacaoInput = z.infer<typeof createAvaliacaoSchema>;
export type UpdateAvaliacaoInput = z.infer<typeof updateAvaliacaoSchema>;
export type AvaliacaoModel = z.infer<typeof avaliacaoSchema>;

export enum TipoAvaliacao {
  AP = "AP", // Avaliação Provincial
  EXAME = "EXAME"
}

export enum Trimestre {
  PRIMEIRO = "1º",
  SEGUNDO = "2º",
  TERCEIRO = "3º"
}

export enum Epoca {
  PRIMEIRA = "1ª",
  SEGUNDA = "2ª"
}

export enum VarianteProva {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  UNICA = "ÚNICA" // Para provas sem variantes
}

export enum AreaEstudo {
  CIENCIAS = "CIÊNCIAS",
  LETRAS = "LETRAS",
  GERAL = "GERAL" // Para disciplinas que não têm divisão por área
}

export interface Avaliacao extends BaseModel {
  tipo: TipoAvaliacao;
  ano: number;
  disciplina: string | Disciplina; // Pode ser um ID ou o objeto completo
  trimestre?: Trimestre;
  provincia?: string | Provincia;
  variante?: VarianteProva;
  epoca?: Epoca;
  areaEstudo?: AreaEstudo;
  classe: number; // 10, 11 ou 12
  titulo?: string;
  questoes?: string[] | Questao[];
}

export interface AvaliacaoForm {
  tipo: TipoAvaliacao;
  ano: number;
  disciplina: string;
  trimestre?: Trimestre;
  provincia?: string;
  variante?: VarianteProva;
  epoca?: Epoca;
  areaEstudo?: AreaEstudo;
  classe: number;
  titulo?: string;
}

export interface AvaliacaoTableItem {
  id: string | number;
  tipo: string;
  ano: number;
  disciplina: string;
  trimestre?: Trimestre;
  provincia?: string;
  variante?: VarianteProva;
  epoca?: Epoca;
  areaEstudo?: AreaEstudo;
  classe: number;
  titulo?: string;
}