import { z } from 'zod';

export interface BaseModel {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export enum TipoUsuario {
  ADMIN = "ADMIN",
  PROFESSOR = "PROFESSOR",
  NORMAL = "NORMAL"
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface TableFilter {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
}