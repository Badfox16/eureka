export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const API_TIMEOUT = 10000; // 10 segundos
export const API_VERSION = 'v1';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: {
    BASE: '/usuarios',
    BY_ID: (id: string) => `/usuarios/${id}`,
    SEARCH: (query: string) => `/usuarios/search?q=${encodeURIComponent(query)}`,
  },
  DISCIPLINAS: {
    BASE: '/disciplinas',
    BY_ID: (id: string) => `/disciplinas/${id}`,
    SEARCH: (query: string) => `/disciplinas/search?q=${encodeURIComponent(query)}`,
  },
  AVALIACOES: {
    BASE: '/avaliacoes',
    BY_ID: (id: string) => `/avaliacoes/${id}`,
    QUESTOES: (id: string) => `/avaliacoes/${id}/questoes`,
    SEARCH: (query: string) => `/avaliacoes/search?q=${encodeURIComponent(query)}`,
  },
  QUESTOES: {
    BASE: '/questoes',
    BY_ID: (id: string) => `/questoes/${id}`,
    SEARCH: (query: string) => `/questoes/search?q=${encodeURIComponent(query)}`,
  },
  PROVINCIAS: {
    BASE: '/provincias',
    BY_ID: (id: string) => `/provincias/${id}`,
  },
  ESTUDANTES: {
    BASE: '/estudantes',
    BY_ID: (id: string) => `/estudantes/${id}`,
    SEARCH: (query: string) => `/estudantes/search?q=${encodeURIComponent(query)}`,
    QUIZZES: (id: string) => `/estudantes/${id}/quizzes`,
    ESTATISTICAS: {
      GERAL: (id: string) => `/estudantes/${id}/estatisticas`,
      POR_DISCIPLINA: (id: string) => `/estudantes/${id}/estatisticas/disciplinas`,
      EVOLUCAO: (id: string) => `/estudantes/${id}/estatisticas/evolucao`,
      QUIZ: (estudanteId: string, quizId: string) => `/estudantes/${estudanteId}/quizzes/${quizId}/estatisticas`,
    },
  },
  QUIZZES: {
    BASE: '/quizzes',
    BY_ID: (id: string) => `/quizzes/${id}`,
    RESPOSTAS: (id: string) => `/quizzes/${id}/respostas`,
  },
  RESPOSTAS: {
    BASE: '/respostas',
    BY_ID: (id: string) => `/respostas/${id}`,
    BY_ESTUDANTE: (estudanteId: string) => `/respostas/estudante/${estudanteId}`,
    BY_QUESTAO: (questaoId: string) => `/respostas/questao/${questaoId}`,
  },
  ESTATISTICAS: {
    DASHBOARD: '/estatisticas/dashboard',
    ESTUDANTES: '/estatisticas/estudantes',
    AVALIACOES: '/estatisticas/avaliacoes',
    DESEMPENHO_GERAL: '/estatisticas/desempenho-geral',
    DISCIPLINAS: '/estatisticas/disciplinas',
  },
  QUIZ_RESPOSTAS: {
    BASE: '/quiz-respostas',
    BY_ID: (id: string) => `/quiz-respostas/${id}`,
    BY_QUIZ: (quizId: string) => `/quiz-respostas/quiz/${quizId}`,
    BY_ESTUDANTE: (estudanteId: string) => `/quiz-respostas/estudante/${estudanteId}`,
  }
};

// Helpers para paginação e filtros
export function paginationParams(page: number = 1, limit: number = 10) {
  return `page=${page}&limit=${limit}`;
}

export function buildQueryParams(params: Record<string, any>) {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return queryParams ? `?${queryParams}` : '';
}