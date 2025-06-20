import { Usuario } from "./usuario";

// Modelo de estudante
export type Estudante = {
  _id: string;
  nome: string;
  email: string;
  classe: number;
  escola?: string;
  provincia?: string;
  usuario: string | Usuario;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

// Tipos para operações com estudante
export type CreateEstudanteInput = {
  nome: string;
  email: string;
  classe: number;
  escola?: string;
  provincia?: string;
  password?: string;
};

export type UpdateEstudanteInput = Partial<CreateEstudanteInput>;

// Tipo para filtros de busca de estudantes
export type EstudanteSearchParams = {
  page: number;
  limit: number;
  search?: string;
  classe?: number;
  escola?: string;
  provincia?: string;
  ativo?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
