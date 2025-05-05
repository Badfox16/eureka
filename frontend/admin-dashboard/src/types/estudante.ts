import { BaseModel } from './base';
import { Provincia } from './provincia';

export interface Estudante extends BaseModel {
  nome: string;
  email: string;
  classe: number;
  provincia?: string | Provincia;
}

export interface EstudanteQuiz extends BaseModel {
  estudante: string | Estudante;
  quiz: string;
  dataInicio: Date;
  dataFim?: Date;
  pontuacaoObtida?: number;
  totalPontos?: number;
  respostasCorretas: number;
  totalQuestoes: number;
  percentualAcerto: number;
}