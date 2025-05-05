import { z } from 'zod';
import { baseResourceSchema, objectIdSchema } from './common.schema';

// Schema para validar criação de resposta
export const createRespostaSchema = z.object({
  estudante: objectIdSchema,
  questao: objectIdSchema,
  alternativaSelecionada: z.string().min(1, 'Alternativa selecionada é obrigatória'),
  estaCorreta: z.boolean(),
  tempoResposta: z.number().nonnegative('Tempo de resposta deve ser positivo').optional(),
});

// Schema para validar atualização de resposta
export const updateRespostaSchema = createRespostaSchema.partial();

// Schema completo de resposta
export const respostaSchema = baseResourceSchema.merge(createRespostaSchema);

// Schema para validar resposta em massa (para quizzes)
export const createRespostaEmMassaSchema = z.object({
  estudante: objectIdSchema,
  respostas: z.array(
    z.object({
      questao: objectIdSchema,
      alternativaSelecionada: z.string().min(1, 'Alternativa selecionada é obrigatória'),
      tempoResposta: z.number().nonnegative('Tempo de resposta deve ser positivo').optional(),
    })
  ).min(1, 'Pelo menos uma resposta é necessária'),
});

// Tipos derivados do schema
export type CreateRespostaInput = z.infer<typeof createRespostaSchema>;
export type UpdateRespostaInput = z.infer<typeof updateRespostaSchema>;
export type RespostaResponse = z.infer<typeof respostaSchema>;
export type CreateRespostaEmMassaInput = z.infer<typeof createRespostaEmMassaSchema>;