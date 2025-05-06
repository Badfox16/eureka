import { z } from 'zod';
import { baseResourceSchema, objectIdSchema } from './common.schema';

export const createEstudanteQuizSchema = z.object({
  estudante: objectIdSchema,
  quiz: objectIdSchema,
  dataInicio: z.date().optional(),
  dataFim: z.date().optional(),
  pontuacaoObtida: z.number().min(0).optional(),
  totalPontos: z.number().min(0).optional(),
  respostasCorretas: z.number().min(0).default(0),
  totalQuestoes: z.number().min(0).default(0),
  percentualAcerto: z.number().min(0).max(100).default(0),
});

export const updateEstudanteQuizSchema = createEstudanteQuizSchema.partial();

export const estudanteQuizSchema = baseResourceSchema.merge(createEstudanteQuizSchema);

// Tipos são definidos no arquivo types/estudanteQuiz.ts