import { Disciplina } from "./disciplina";
import { Provincia } from "./provincia";
import { Questao } from "./questao";
import { Usuario } from "./usuario";

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
  UNICA = "ÚNICA"
}

export enum AreaEstudo {
  CIENCIAS = "CIÊNCIAS",
  LETRAS = "LETRAS",
  GERAL = "GERAL"
}

// Modelo de avaliação (equivalente ao Quiz do frontend)
export type Avaliacao = {
  _id: string;
  tipo: TipoAvaliacao;
  ano: number;
  disciplina: string | Disciplina;
  classe: number;
  trimestre?: Trimestre;
  provincia?: string | Provincia;
  epoca?: Epoca;
  variante: VarianteProva;
  areaEstudo: AreaEstudo;
  titulo?: string;
  questoes: string[] | Questao[];
  createdAt: string;
  updatedAt: string;
};

// Tipos para operações com Avaliação
export type CreateAvaliacaoInput = {
  tipo: TipoAvaliacao;
  ano: number;
  disciplina: string;
  classe: number;
  trimestre?: Trimestre;
  provincia?: string;
  epoca?: Epoca;
  variante?: VarianteProva;
  areaEstudo?: AreaEstudo;
  titulo?: string;
};

export type UpdateAvaliacaoInput = Partial<CreateAvaliacaoInput>;

// Tipo para filtros de busca de avaliações
export type AvaliacaoSearchParams = {
  page: number;
  limit: number;
  tipo?: TipoAvaliacao;
  ano?: number;
  disciplina?: string;
  trimestre?: Trimestre;
  provincia?: string;
  variante?: VarianteProva;
  epoca?: Epoca;
  areaEstudo?: AreaEstudo;
  classe?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
