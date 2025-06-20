// Modelo de província
export type Provincia = {
  _id: string;
  nome: string;
  codigo?: string;
  regiao?: string;
  createdAt: string;
  updatedAt: string;
};

// Tipos para operações com província
export type CreateProvinciaInput = {
  nome: string;
  codigo?: string;
  regiao?: string;
};

export type UpdateProvinciaInput = Partial<CreateProvinciaInput>;

// Tipo para filtros de busca de províncias
export type ProvinciaSearchParams = {
  page: number;
  limit: number;
  search?: string;
  regiao?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
