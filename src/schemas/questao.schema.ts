import { z } from 'zod';
import { baseResourceSchema, objectIdSchema } from './common.schema';

// Schema para alternativas
export const alternativaSchema = z.object({
  letra: z.string().min(1).max(1),
  texto: z.string().min(1, 'Texto da alternativa é obrigatório'),
  correta: z.boolean().default(false)
});

// Schema para validar criação de questão
export const createQuestaoSchema = z.object({
  numero: z.number().int().positive('Número da questão deve ser positivo'),
  enunciado: z.string().min(1, 'Enunciado é obrigatório'),
  alternativas: z.array(alternativaSchema)
    .min(3, 'É necessário pelo menos 3 alternativas')
    .refine(
      (alternativas) => alternativas.filter(alt => alt.correta).length === 1,
      { message: 'Deve haver exatamente uma alternativa correta' }
    ),
  explicacao: z.string().optional(),
  avaliacao: objectIdSchema,
  valor: z.number().min(0, 'Valor deve ser no mínimo 0').default(0.5).optional() 
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