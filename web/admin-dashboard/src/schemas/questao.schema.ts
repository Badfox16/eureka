import { z } from 'zod';
import { baseResourceSchema, objectIdSchema } from './common.schema';

// Schema para alternativas
export const alternativaSchema = z.object({
  letra: z.string().min(1).max(1),
  texto: z.string().min(1, 'Texto da alternativa é obrigatório'),
  correta: z.boolean().default(false),
  imagemUrl: z.string().url().optional()
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
  imagemEnunciadoUrl: z.string().url().optional(),
  avaliacao: objectIdSchema,
  valor: z.number().min(0, 'Valor deve ser no mínimo 0').default(0.5)
});

// Schema para validar atualização de questão
export const updateQuestaoSchema = createQuestaoSchema.partial();

// Schema completo de questão
export const questaoSchema = baseResourceSchema.merge(createQuestaoSchema);

// Schema para questão com dados populados
export const questaoPopuladaSchema = questaoSchema.extend({
  avaliacao: z.object({
    _id: z.string(),
    titulo: z.string(),
    ano: z.number(),
    disciplina: z.object({
      _id: z.string(),
      nome: z.string(),
      codigo: z.string()
    })
  })
});

// Schema para parâmetros de consulta
export const questaoQueryParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  disciplina: z.string().optional(),
  avaliacaoId: z.string().optional(),
  notInAvaliacao: z.string().optional()
});