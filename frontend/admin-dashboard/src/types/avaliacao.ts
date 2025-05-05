import { BaseModel } from './base';
import { Disciplina } from './disciplina';
import { Provincia } from './provincia';
import { Questao } from './questao';

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