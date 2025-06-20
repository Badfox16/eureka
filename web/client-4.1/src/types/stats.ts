// Modelo de estatísticas do usuário
export type EstatisticasUsuario = {
  usuarioId: string;
  totalQuizzes: number;
  totalQuestoes: number;
  respostasCorretas: number;
  respostasIncorretas: number;
  mediaNotas: number;
  quizzesPorMateria: Record<string, number>;
  notasPorMateria: Record<string, number>;
  atividadesRecentes: AtividadeRecente[];
  insignias: Insignia[];
  atualizadoEm: string;
};

// Modelo de atividade recente
export type AtividadeRecente = {
  id: string;
  tipo: TipoAtividade;
  entidadeId: string;
  titulo: string;
  nota?: number;
  data: string;
};

// Modelo de conquista/insignia
export type Insignia = {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  obtidaEm: string;
};

// Enum para tipos de atividade
export enum TipoAtividade {
  QUIZ_CONCLUIDO = 'quiz_concluido',
  INSIGNIA_OBTIDA = 'insignia_obtida',
  PERFIL_ATUALIZADO = 'perfil_atualizado'
}

// Mantendo compatibilidade com o código existente
// até que seja totalmente refatorado
export type UserStats = EstatisticasUsuario;
export type RecentActivity = AtividadeRecente;
export type Badge = Insignia;
export type ActivityType = TipoAtividade;
