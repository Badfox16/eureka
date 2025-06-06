import { z } from 'zod';
import { baseResourceSchema, classeSchema, objectIdSchema } from './common.schema';
import { TipoAvaliacao, Trimestre, Epoca, VarianteProva, AreaEstudo } from '../models/avaliacao';

// Usando os enums do modelo
export const tipoAvaliacaoSchema = z.nativeEnum(TipoAvaliacao, {
  errorMap: () => ({ message: 'Tipo de avaliação inválido' })
});

export const trimestreSchema = z.nativeEnum(Trimestre, {
  errorMap: () => ({ message: 'Trimestre inválido' })
});

export const epocaSchema = z.nativeEnum(Epoca, {
  errorMap: () => ({ message: 'Época inválida' })
});

export const varianteProvaSchema = z.nativeEnum(VarianteProva, {
  errorMap: () => ({ message: 'Variante de prova inválida' })
});

export const areaEstudoSchema = z.nativeEnum(AreaEstudo, {
  errorMap: () => ({ message: 'Área de estudo inválida' })
});

// Schema base para avaliação
const avaliacaoBaseSchema = z.object({
  tipo: tipoAvaliacaoSchema,
  ano: z.number().int().min(2000, 'Ano deve ser pelo menos 2000').max(new Date().getFullYear() + 1, 'Ano não pode ser mais de um ano no futuro'),
  disciplina: objectIdSchema,
  classe: classeSchema,
  titulo: z.string().max(200, 'Título não pode exceder 200 caracteres').optional(),
  variante: varianteProvaSchema.default(VarianteProva.UNICA),
  areaEstudo: areaEstudoSchema.default(AreaEstudo.GERAL),
});

// Schema específico para AP
const apSchema = avaliacaoBaseSchema.extend({
  tipo: z.literal(TipoAvaliacao.AP),
  trimestre: trimestreSchema,
  provincia: objectIdSchema,
  epoca: z.undefined().optional(),
  questoes: z.array(objectIdSchema).optional(),
});

// Schema específico para EXAME
const exameSchema = avaliacaoBaseSchema.extend({
  tipo: z.literal(TipoAvaliacao.EXAME),
  epoca: epocaSchema,
  trimestre: z.undefined().optional(),
  provincia: z.undefined().optional(),
  questoes: z.array(objectIdSchema).optional(),
});

// Schema para validar criação de avaliação (união discriminada)
export const createAvaliacaoSchema = z.discriminatedUnion('tipo', [
  apSchema,
  exameSchema,
]);

// Schema para validar atualização de avaliação
export const updateAvaliacaoSchema = z.object({
  tipo: tipoAvaliacaoSchema.optional(),
  ano: z.number().int().min(2000).max(new Date().getFullYear() + 1).optional(),
  disciplina: objectIdSchema.optional(),
  classe: classeSchema.optional(),
  trimestre: trimestreSchema.optional(),
  provincia: objectIdSchema.optional(),
  epoca: epocaSchema.optional(),
  variante: varianteProvaSchema.optional(),
  areaEstudo: areaEstudoSchema.optional(),
  titulo: z.string().max(200).optional(),
  questoes: z.array(objectIdSchema).optional(),
}).refine(
  (data) => {
    // Se não estiver atualizando o tipo, não precisa validar mais nada
    if (!data.tipo) return true;
    
    // Se estiver atualizando para AP, deve fornecer trimestre ou não fornecer época
    if (data.tipo === TipoAvaliacao.AP && data.epoca !== undefined) {
      return false;
    }
    
    // Se estiver atualizando para EXAME, deve fornecer época ou não fornecer trimestre
    if (data.tipo === TipoAvaliacao.EXAME && data.trimestre !== undefined) {
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
    provincia: objectIdSchema.optional(),
    epoca: epocaSchema.optional(),
    variante: varianteProvaSchema.default(VarianteProva.UNICA),
    areaEstudo: areaEstudoSchema.default(AreaEstudo.GERAL),
    titulo: z.string().max(200).optional(),
    questoes: z.array(objectIdSchema).default([]),
  })
).refine(
  (data) => {
    if (data.tipo === TipoAvaliacao.AP) return !!data.trimestre && !data.epoca && !!data.provincia;
    if (data.tipo === TipoAvaliacao.EXAME) return !!data.epoca && !data.trimestre && !data.provincia;
    return true;
  },
  {
    message: "AP requer trimestre e provincia, EXAME requer apenas época",
    path: ["tipo"],
  }
);

// Tipos derivados do schema
export type CreateAvaliacaoInput = z.infer<typeof createAvaliacaoSchema>;
export type UpdateAvaliacaoInput = z.infer<typeof updateAvaliacaoSchema>;
export type AvaliacaoResponse = z.infer<typeof avaliacaoSchema>;