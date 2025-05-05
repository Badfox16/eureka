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
  },
  DISCIPLINAS: {
    BASE: '/disciplinas',
    BY_ID: (id: string) => `/disciplinas/${id}`,
  },
  AVALIACOES: {
    BASE: '/avaliacoes',
    BY_ID: (id: string) => `/avaliacoes/${id}`,
    QUESTOES: (id: string) => `/avaliacoes/${id}/questoes`,
  },
  QUESTOES: {
    BASE: '/questoes',
    BY_ID: (id: string) => `/questoes/${id}`,
  },
  PROVINCIAS: {
    BASE: '/provincias',
    BY_ID: (id: string) => `/provincias/${id}`,
  },
  ESTATISTICAS: {
    DASHBOARD: '/estatisticas/dashboard',
    ESTUDANTES: '/estatisticas/estudantes',
    AVALIACOES: '/estatisticas/avaliacoes',
  }
};