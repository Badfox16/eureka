// Modelo de disciplina
export type Disciplina = {
  _id: string;
  nome: string;
  codigo: string;
  descricao?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

// Tipos para operações com disciplina
export type CreateDisciplinaInput = {
  nome: string;
  codigo: string;
  descricao?: string;
  ativo?: boolean;
};

export type UpdateDisciplinaInput = Partial<CreateDisciplinaInput>;

// Tipo para filtros de busca de disciplinas
export type DisciplinaSearchParams = {
  page: number;
  limit: number;
  search?: string;
  ativo?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
