export interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tipo?: string;
  ordem?: 'asc' | 'desc';
  ordenarPor?: string;
  [key: string]: any;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}
