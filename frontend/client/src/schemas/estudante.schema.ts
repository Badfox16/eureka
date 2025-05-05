import { z } from 'zod';
import { baseResourceSchema, classeSchema, objectIdSchema } from './common.schema';

// Schema para validar criação de estudante
export const createEstudanteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  classe: classeSchema,
  escola: z.string().optional(),
  provincia: z.string().optional(),
});

// Schema para validar atualização de estudante
export const updateEstudanteSchema = createEstudanteSchema.partial();

// Schema completo de estudante
export const estudanteSchema = baseResourceSchema.merge(
  createEstudanteSchema.extend({
    respostas: z.array(objectIdSchema).optional(),
  })
);

// Tipos derivados do schema
export type CreateEstudanteInput = z.infer<typeof createEstudanteSchema>;
export type UpdateEstudanteInput = z.infer<typeof updateEstudanteSchema>;
export type EstudanteResponse = z.infer<typeof estudanteSchema>;