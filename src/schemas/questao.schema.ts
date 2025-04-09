import { z } from 'zod';
import { baseResourceSchema, objectIdSchema } from './common.schema';

// Schema para alternativas
export const alternativaSchema = z.object({
  letra: z.string().min(1).max(1),
  texto: z.string().min(1),
  correta: z.boolean(),
});

// Schema para validar criação de questão
export const createQuestaoSchema = z.object({
  numero: z.number().int().positive(),
  enunciado: z.string().min(1),
  alternativas: z.array(alternativaSchema)
    .min(2, 'É necessário pelo menos 2 alternativas')
    .refine(
      (alternativas) => alternativas.filter(alt => alt.correta).length === 1,
      { message: 'Deve haver exatamente uma alternativa correta' }
    ),
  explicacao: z.string().optional(),
  avaliacao: objectIdSchema,
});

// Schema para validar atualização de questão
export const updateQuestaoSchema = createQuestaoSchema.partial();

// Schema completo de questão
export const questaoSchema = baseResourceSchema.merge(createQuestaoSchema);

// Tipos derivados do schema
export type CreateQuestaoInput = z.infer<typeof createQuestaoSchema>;
export type UpdateQuestaoInput = z.infer<typeof updateQuestaoSchema>;
export type QuestaoResponse = z.infer<typeof questaoSchema>;
export type Alternativa = z.infer<typeof alternativaSchema>;