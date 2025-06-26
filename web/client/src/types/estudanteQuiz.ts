import { Estudante } from "./estudante";
import { Quiz } from "./quiz";

// Modelo de estudante-quiz (tentativa)
export type EstudanteQuiz = {
  _id: string;
  estudante: string | Estudante;
  quiz: string | Quiz;
  dataInicio: string;
  dataFim?: string;
  pontuacaoObtida?: number;
  totalPontos?: number;
  respostasCorretas: number;  // Número de respostas corretas
  totalQuestoes: number;      // Total de questões do quiz
  percentualAcerto: number;   // Percentual já calculado (pode estar como fração 0-1 ou como percentual 0-100)
  tempoTotal?: number;        // Tempo total gasto no quiz em segundos
  acertos?: number;           // Campo alternativo para acertos (depreciado)
  respostas?: Array<{         // Este campo pode não estar presente em todas as respostas da API
    questao: string;
    alternativa: string;
    alternativaSelecionada?: string; // Algumas APIs podem usar este nome
    correta: boolean;
    tempo: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

// Tipos para operações com estudante-quiz
export type CreateEstudanteQuizInput = {
  estudante: string;
  quiz: string;
  dataInicio?: Date;
  dataFim?: Date;
  pontuacaoObtida?: number;
  totalPontos?: number;
  respostasCorretas?: number;
  totalQuestoes?: number;
  percentualAcerto?: number;
};

export type UpdateEstudanteQuizInput = Partial<CreateEstudanteQuizInput>;

// Tipo para filtros de busca de estudante-quiz
export type EstudanteQuizSearchParams = {
  page: number;
  limit: number;
  estudanteId?: string;
  quizId?: string;
  dataInicio?: string;
  dataFim?: string;
  concluido?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
