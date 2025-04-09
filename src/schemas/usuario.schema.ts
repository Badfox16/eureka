import { z } from 'zod';
import { baseResourceSchema } from './common.schema';

// Schema para validar criação de usuário
export const createUsuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

// Schema para validar atualização de usuário
export const updateUsuarioSchema = createUsuarioSchema.partial();

// Schema completo de usuário (incluindo campos gerados)
export const usuarioSchema = baseResourceSchema.merge(createUsuarioSchema);

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Schema de resposta excluindo dados sensíveis
export const usuarioResponseSchema = usuarioSchema.omit({ password: true });

// Tipos derivados do schema
export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
export type UsuarioResponse = z.infer<typeof usuarioResponseSchema>;
export type LoginInput = z.infer<typeof loginSchema>;