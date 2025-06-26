import { z } from 'zod';

// Esquema de validação para login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-mail é obrigatório' })
    .email({ message: 'E-mail inválido' }),
  password: z
    .string()
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

// Esquema de validação para cadastro
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
  classe: z
    .number({
      required_error: 'Classe é obrigatória',
      invalid_type_error: 'Classe deve ser um número',
    })
    .min(3, { message: 'Classe deve ser 3ª ou superior' })
    .max(12, { message: 'Classe não pode exceder a 12ª' })
    .refine((val) => [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(val), {
      message: 'Classe inválida',
    }),
  provincia: z
    .string()
    .min(2, { message: 'Província deve ter pelo menos 2 caracteres' })
    .max(50, { message: 'Província não pode exceder 50 caracteres' })
    .optional(),
});

// Tipos inferidos dos esquemas
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
