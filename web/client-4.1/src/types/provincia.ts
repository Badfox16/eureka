// Modelo de província
export type Provincia = {
  _id: string;
  nome: string;
  codigo?: string;
  regiao?: string;
  createdAt: string;
  updatedAt: string;
};

// Versão simplificada para uso em selects
export type ProvinciaSelect = Pick<Provincia, '_id' | 'nome'>;

// Tipos para operações com província
export type CreateProvinciaInput = {
  nome: string;
  codigo?: string;
  regiao?: string;
};

export type UpdateProvinciaInput = Partial<CreateProvinciaInput>;

// Tipo para filtros de busca de províncias
export type ProvinciaSearchParams = {
  page?: number;
  limit?: number;
  nome?: string;
  codigo?: string;
  regiao?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};
