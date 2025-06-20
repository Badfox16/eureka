import { EstudanteQuiz } from "./estudanteQuiz";
import { Questao } from "./questao";

// Modelo de resposta de quiz
export type QuizResposta = {
  _id: string;
  estudanteQuiz: string | EstudanteQuiz;
  questao: string | Questao;
  respostaEscolhida: string;
  estaCorreta: boolean;
  tempoResposta?: number;
  pontuacaoObtida: number;
  createdAt: string;
  updatedAt: string;
};

// Tipos para operações com resposta de quiz
export type CreateQuizRespostaInput = {
  estudanteQuiz: string;
  questao: string;
  respostaEscolhida: string;
  estaCorreta?: boolean;
  tempoResposta?: number;
  pontuacaoObtida?: number;
};

export type UpdateQuizRespostaInput = Partial<CreateQuizRespostaInput>;

// Esquema para iniciar um quiz
export type IniciarQuizInput = {
  estudanteId: string;
  quizId: string;
};

// Esquema para registrar uma resposta
export type RegistrarRespostaInput = {
  estudanteQuizId: string;
  questaoId: string;
  respostaEscolhida: string;
  tempoResposta?: number;
};
