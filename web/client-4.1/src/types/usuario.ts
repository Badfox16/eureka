import { z } from 'zod';

export enum TipoUsuario {
  ADMIN = "ADMIN",
  PROFESSOR = "PROFESSOR",
  NORMAL = "NORMAL"
}

// Modelo de usuário
export type Usuario = {
  _id: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
};

// Tipo para filtros de busca de usuários
export type UsuarioSearchParams = {
  page: number;
  limit: number;
  search?: string;
  tipo?: string;
  ativo?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

// Tipos para requisições de autenticação
export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  nome: string;
  email: string;
  password: string;
  tipo?: TipoUsuario;
};

export type AuthResponse = {
  data: {
    usuario: Usuario;
    token: string;
  };
};

// Schemas de validação
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-mail é obrigatório' })
    .email({ message: 'E-mail inválido' }),
  password: z
    .string()
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

export const registerSchema = z.object({
  nome: z
    .string()
    .min(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'Nome não pode exceder 100 caracteres' }),
  email: z
    .string()
    .min(1, { message: 'E-mail é obrigatório' })
    .email({ message: 'E-mail inválido' }),
  password: z
    .string()
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
    .max(100, { message: 'Senha não pode exceder 100 caracteres' }),
  tipo: z.nativeEnum(TipoUsuario).optional(),
});

// Tipos inferidos dos schemas
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
