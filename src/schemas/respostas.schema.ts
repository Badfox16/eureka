import { z } from 'zod';
import { baseResourceSchema, objectIdSchema } from './common.schema';

// Schema para validar criação de resposta
export const createRespostaSchema = z.object({
  estudante: objectIdSchema,
  questao: objectIdSchema,
  alternativaSelecionada: z.string().min(1).max(1),
  estaCorreta: z.boolean(),
  tempoResposta: z.number().nonnegative().optional(),
});

// Schema para validar atualização de resposta
export const updateRespostaSchema = createRespostaSchema.partial();

// Schema completo de resposta
export const respostaSchema = baseResourceSchema.merge(createRespostaSchema);

// Tipos derivados do schema
export type CreateRespostaInput = z.infer<typeof createRespostaSchema>;
export type UpdateRespostaInput = z.infer<typeof updateRespostaSchema>;
export type RespostaResponse = z.infer<typeof respostaSchema>;