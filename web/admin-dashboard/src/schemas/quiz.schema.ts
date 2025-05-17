import { z } from 'zod';
import { baseResourceSchema, objectIdSchema } from './common.schema';

// Schema para validar criação de quiz
export const createQuizSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  avaliacao: objectIdSchema,
  tempoLimite: z.number().positive('Tempo limite deve ser um valor positivo').optional(),
  ativo: z.boolean().default(true),
});

// Schema para validar atualização de quiz
export const updateQuizSchema = createQuizSchema.partial();

// Schema completo de quiz
export const quizSchema = baseResourceSchema.merge(createQuizSchema);

// Tipos são definidos no arquivo types/quiz.ts