import { z } from 'zod';
import { baseResourceSchema, classeSchema, objectIdSchema } from './common.schema';

// Enums baseados nos modelos existentes (usando valores simples)
export const tipoAvaliacaoSchema = z.enum(['AP', 'EXAME']);

// Usando valores mais simples para evitar problemas com caracteres especiais
export const trimestreSchema = z.enum(['1', '2', '3']).transform(val => `${val}º` as const);
export const epocaSchema = z.enum(['1', '2']).transform(val => `${val}ª` as const);

// Schema base para avaliação
const avaliacaoBaseSchema = z.object({
  tipo: tipoAvaliacaoSchema,
  ano: z.number().int().min(2000).max(new Date().getFullYear()),
  disciplina: objectIdSchema,
  classe: classeSchema,
});

// Schema específico para AP
const apSchema = avaliacaoBaseSchema.extend({
  tipo: z.literal('AP'),
  trimestre: trimestreSchema,
  epoca: z.undefined().optional(),
});

// Schema específico para EXAME
const exameSchema = avaliacaoBaseSchema.extend({
  tipo: z.literal('EXAME'),
  epoca: epocaSchema,
  trimestre: z.undefined().optional(),
});

// Schema para validar criação de avaliação (união discriminada)
export const createAvaliacaoSchema = z.discriminatedUnion('tipo', [
  apSchema,
  exameSchema,
]);

// Schema para validar atualização de avaliação
export const updateAvaliacaoSchema = z.object({
  tipo: tipoAvaliacaoSchema.optional(),
  ano: z.number().int().min(2000).max(new Date().getFullYear()).optional(),
  disciplina: objectIdSchema.optional(),
  classe: classeSchema.optional(),
  trimestre: trimestreSchema.optional(),
  epoca: epocaSchema.optional(),
}).refine(
  (data) => {
    // Se estiver atualizando o tipo para AP, trimestre deve estar presente
    if (data.tipo === 'AP' && data.trimestre === undefined && data.epoca !== undefined) {
      return false;
    }
    // Se estiver atualizando o tipo para EXAME, epoca deve estar presente
    if (data.tipo === 'EXAME' && data.epoca === undefined && data.trimestre !== undefined) {
      return false;
    }
    return true;
  },
  {
    message: "Valores incompatíveis: AP requer trimestre (sem época) e EXAME requer época (sem trimestre)",
    path: ["tipo"],
  }
);

// Schema completo de avaliação
export const avaliacaoSchema = baseResourceSchema.merge(
  z.object({
    tipo: tipoAvaliacaoSchema,
    ano: z.number().int().min(2000).max(new Date().getFullYear()),
    disciplina: objectIdSchema,
    classe: classeSchema,
    trimestre: trimestreSchema.optional(),
    epoca: epocaSchema.optional(),
    questoes: z.array(objectIdSchema).default([]),
  })
).refine(
  (data) => {
    if (data.tipo === 'AP') return !!data.trimestre && !data.epoca;
    if (data.tipo === 'EXAME') return !!data.epoca && !data.trimestre;
    return true;
  },
  {
    message: "AP requer apenas trimestre e EXAME requer apenas época",
    path: ["tipo"],
  }
);

// Tipos derivados do schema
export type CreateAvaliacaoInput = z.infer<typeof createAvaliacaoSchema>;
export type UpdateAvaliacaoInput = z.infer<typeof updateAvaliacaoSchema>;
export type AvaliacaoResponse = z.infer<typeof avaliacaoSchema>;