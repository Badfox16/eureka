// Tipos para requisições de autenticação
export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  nome: string;
  email: string;
  password: string;
};

// Tipos de respostas da API
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: PaginationData;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

// Tipo para dados de paginação
export type PaginationData = {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
};

// Parâmetros de paginação para requisições
export type PaginationParams = {
  page: number;
  limit: number;
};

export type AuthResponse = {
  usuario: Usuario;
  token: string;
};

// Modelo de usuário
export type Usuario = {
  _id: string;
  nome: string;
  email: string;
  tipo: 'ADMIN' | 'PROFESSOR' | 'NORMAL';
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

// Enums para status de requisição
export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}
