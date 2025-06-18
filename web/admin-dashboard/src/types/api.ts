export interface PaginationInfo {
  total: number;                // Total de itens
  totalPages: number;           // Total de páginas
  currentPage: number;          // Página atual
  limit: number;                // Itens por página
  hasPrevPage: boolean;         // Tem página anterior
  hasNextPage: boolean;         // Tem próxima página
  prevPage: number | null;      // Número da página anterior
  nextPage: number | null;      // Número da próxima página
}

export interface ApiResponse<T> {
  status?: string;
  data: T;
  pagination?: PaginationInfo;
}

// Interface para resposta paginada (mais específica que ApiResponse)
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo; // Torna a paginação obrigatória
}

// Interface genérica para parâmetros de consulta
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any; // Para permitir outros filtros específicos
}
