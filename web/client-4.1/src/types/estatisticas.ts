import { Avaliacao } from "./avaliacao";
import { Disciplina } from "./disciplina";
import { Estudante } from "./estudante";
import { Provincia } from "./provincia";
import { Quiz } from "./quiz";

// Estatísticas gerais
export type EstatisticasGerais = {
  totalEstudantes: number;
  totalQuizzes: number;
  totalAvaliacoes: number;
  totalTentativas: number;
  mediaAcertos: number;
  quizzesPopulares: QuizPopular[];
  avaliacoesPopulares: AvaliacaoPopular[];
};

// Estatísticas por estudante
export type EstatisticasEstudante = {
  estudante: Estudante;
  tentativas: number;
  quizzesCompletos: number;
  mediaAcertos: number;
  totalPontos: number;
  disciplinasFortes: DisciplinaDesempenho[];
  disciplinasFracas: DisciplinaDesempenho[];
  progresso: ProgressoTempo[];
};

// Alias para EstatisticasEstudante para compatibilidade com a API
export type Estatistica = EstatisticasEstudante;

// Estatísticas por disciplina para um estudante
export type EstatisticaDisciplina = {
  disciplina: {
    _id: string;
    nome: string;
    codigo: string;
  };
  quizzes: number;
  totalQuestoes: number;
  respostasCorretas: number;
  percentualAcerto: number;
};

// Evolução de desempenho ao longo do tempo
export type EvolucaoDesempenho = {
  periodos: {
    periodo: string; // Mês/Ano ou semana
    quizzes: number;
    percentualAcerto: number;
  }[];
};

// Ranking de estudantes
export type RankingEstudante = {
  posicao: number;
  estudante: Estudante;
  pontuacaoTotal: number;
  percentualAcerto: number;
  quizzesCompletos: number;
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
  disciplina: Disciplina;
  mediaAcertos: number;
  tentativas: number;
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
