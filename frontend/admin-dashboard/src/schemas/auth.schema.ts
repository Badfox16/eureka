import { z } from 'zod';
import { TipoUsuario } from '../models/usuario';
import { createEstudanteSchema as baseEstudanteSchema } from './estudante.schema';

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

// Schema para registro de usuário
export const registerSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  tipo: z.enum([TipoUsuario.ADMIN, TipoUsuario.PROFESSOR, TipoUsuario.NORMAL]).optional()
});

// Reexportamos o schema de estudante para uso no controller de autenticação
export const createEstudanteSchema = baseEstudanteSchema;

// Tipos derivados dos schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;