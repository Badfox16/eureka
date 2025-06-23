import { Avaliacao } from "./avaliacao";
import { Disciplina } from "./disciplina";
import { Estudante } from "./estudante";
import { Provincia } from "./provincia";
import { Quiz } from "./quiz";

// Tipos para as estatísticas retornadas pela API
export type EstatisticasGerais = {
  geral: {
    totalQuizzes: number;
    totalQuestoes: number;
    respostasCorretas: number;
    percentualAcerto: number;
  };
  disciplinas: Array<{
    nome: string;
    quizzes: number;
    totalQuestoes: number;
    respostasCorretas: number;
    percentualAcerto: number;
  }>;
  evolucao: Array<{
    data: string;
    percentual: number;
    quiz: string;
  }>;
};

// Tipo para uma tentativa de quiz no histórico
export type TentativaQuizHistorico = {
  _id: string;
  dataInicio: string;
  dataFim?: string;
  pontuacaoObtida: number;
  totalPontos: number;
  respostasCorretas: number;
  totalQuestoes: number;
  percentualAcerto: number;
  quiz: {
    _id: string;
    titulo: string;
    avaliacao: {
      _id: string;
      titulo: string;
      disciplina: {
        _id: string;
        nome: string;
        codigo: string;
      };
    };
  };
};

// Estatísticas por disciplina para um estudante
export type EstatisticaDisciplina = {
  nome: string;
  quizzes: number;
  totalQuestoes: number;
  respostasCorretas: number;
  percentualAcerto: number;
};

// Evolução de desempenho ao longo do tempo
export type EvolucaoDesempenho = Array<{
  data: string;
  percentual: number;
  quiz: string;
}>;

// Ranking de estudantes
export type RankingEstudante = {
  estudante: {
    _id: string;
    nome: string;
    email: string;
    escola: string;
  };
  pontuacaoTotal: number;
  mediaAcertos: number;
  quizzesCompletos: number;
  posicao: number;
};

// Estatísticas por quiz
export type EstatisticasQuiz = {
  quiz: Quiz;
  tentativasTotal: number;
  mediaAcertos: number;
  tempoMedioCompletar: number;
  distribuicaoNotas: DistribuicaoNotas[];
  questoesDificeis: QuestaoEstatistica[];
  questoesFaceis: QuestaoEstatistica[];
};

// Estatísticas por província
export type EstatisticasProvincia = {
  provincia: Provincia;
  estudantesAtivos: number;
  mediaAcertosProvincia: number;
  disciplinasFortes: DisciplinaDesempenho[];
  disciplinasFracas: DisciplinaDesempenho[];
  comparativoNacional: ComparativoNacional;
};

// Tipos auxiliares
export type QuizPopular = {
  quiz: Quiz;
  tentativas: number;
  satisfacao: number;
};

export type AvaliacaoPopular = {
  avaliacao: Avaliacao;
  acessos: number;
  quizzes: number;
};

export type DisciplinaDesempenho = {
  disciplina: {
    _id: string;
    nome: string;
    codigo: string;
  };
  mediaAcertos: number;
  tentativas: number;
  percentualAcerto: number;
};

export type ProgressoTempo = {
  data: string;
  tentativas: number;
  acertos: number;
};

export type DistribuicaoNotas = {
  faixa: string;
  quantidade: number;
  percentual: number;
};

export type QuestaoEstatistica = {
  questaoId: string;
  numero: number;
  enunciado: string;
  percentualAcerto: number;
  tempoMedio: number;
};

export type ComparativoNacional = {
  posicaoRanking: number;
  mediaAcertosNacional: number;
  diferencaPercentual: number;
};

// Estatísticas específicas para um estudante
export type EstatisticasEstudante = {
  quizzesCompletos: number;
  mediaAcertos: number;
  totalPontos: number;
  ultimaTentativa?: TentativaQuizHistorico;
  disciplinasFortes: DisciplinaDesempenho[];
  historico: TentativaQuizHistorico[];
};
