import { z } from 'zod';
import { baseResourceSchema } from './common.schema';
import { TipoUsuario } from '../models/usuario';

// Schema para validar criação de usuário
export const createUsuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  tipo: z.nativeEnum(TipoUsuario, {
    errorMap: () => ({ message: 'Tipo de usuário inválido' })
  }).default(TipoUsuario.NORMAL).optional(),
});

// Schema para fazer login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Schema para alterar senha
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
});

// Schema para validar atualização de usuário
export const updateUsuarioSchema = createUsuarioSchema.partial();

// Schema completo de usuário
export const usuarioSchema = baseResourceSchema.merge(
  createUsuarioSchema.extend({
    password: z.string().min(6),
    tipo: z.nativeEnum(TipoUsuario).default(TipoUsuario.NORMAL),
  })
);

// Tipos derivados do schema
export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
export type UsuarioResponse = z.infer<typeof usuarioSchema>;