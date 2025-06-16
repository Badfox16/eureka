export interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  pagination?: PaginationInfo;
}

// Interface genérica para parâmetros de consulta
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: any; // Para permitir outros filtros específicos
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}
