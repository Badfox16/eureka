import { z } from 'zod';
import { baseResourceSchema, objectIdSchema } from './common.schema';

// Enums correspondentes aos do modelo
export const TipoAvaliacaoEnum = z.enum(['AP', 'EXAME']);
export const TrimestreEnum = z.enum(['1º', '2º', '3º']);
export const EpocaEnum = z.enum(['1ª', '2ª']);
export const VarianteProvaEnum = z.enum(['A', 'B', 'C', 'D', 'ÚNICA']);
export const AreaEstudoEnum = z.enum(['CIÊNCIAS', 'LETRAS', 'GERAL']);

// Schema base sem validações condicionais
export const baseAvaliacaoSchema = z.object({
  tipo: TipoAvaliacaoEnum,
  ano: z.number()
    .int()
    .min(2000, 'O ano deve ser 2000 ou posterior')
    .max(new Date().getFullYear(), 'O ano não pode ser maior que o ano atual'),
  disciplina: objectIdSchema,
  trimestre: TrimestreEnum.optional(),
  provincia: objectIdSchema.optional(),
  variante: VarianteProvaEnum.default('ÚNICA'),
  epoca: EpocaEnum.optional(),
  areaEstudo: AreaEstudoEnum.default('GERAL'),
  classe: z.number().int().min(10).max(12),
  titulo: z.string().max(200).optional(),
  questoes: z.array(objectIdSchema).default([]),
});

// Schema para validação - usando z.preprocess para validação condicional
export const createAvaliacaoSchema = z.preprocess(
  // O preprocess não modifica o tipo do schema, apenas valida
  (data: any) => {
    // Validações personalizadas
    const parsedData = baseAvaliacaoSchema.parse(data);
    const errors: { path: string[], message: string }[] = [];
    
    // Validação para AP
    if (parsedData.tipo === 'AP') {
      if (!parsedData.trimestre) {
        errors.push({
          path: ['trimestre'],
          message: 'Trimestre é obrigatório para Avaliações Provinciais'
        });
      }
      
      if (!parsedData.provincia) {
        errors.push({
          path: ['provincia'],
          message: 'Província é obrigatória para Avaliações Provinciais'
        });
      }
    }
    
    // Validação para EXAME
    if (parsedData.tipo === 'EXAME' && !parsedData.epoca) {
      errors.push({
        path: ['epoca'],
        message: 'Época é obrigatória para Exames'
      });
    }
    
    // Se houver erros, lançar exceção
    if (errors.length > 0) {
      throw new z.ZodError(errors.map(err => ({
        code: z.ZodIssueCode.custom,
        path: err.path,
        message: err.message
      })));
    }
    
    return data;
  },
  // O schema original permanece como um ZodObject
  baseAvaliacaoSchema
);

// Schema para validar atualização de avaliação
export const updateAvaliacaoSchema = baseAvaliacaoSchema.partial();

// Schema para filtrar avaliações
export const filterAvaliacaoSchema = z.object({
  tipo: TipoAvaliacaoEnum.optional(),
  ano: z.number().int().optional(),
  disciplina: objectIdSchema.optional(),
  trimestre: TrimestreEnum.optional(),
  provincia: objectIdSchema.optional(),
  variante: VarianteProvaEnum.optional(),
  epoca: EpocaEnum.optional(),
  areaEstudo: AreaEstudoEnum.optional(),
  classe: z.number().int().min(10).max(12).optional(),
  search: z.string().optional(),
});

// Schema completo de avaliação
export const avaliacaoSchema = baseResourceSchema.merge(baseAvaliacaoSchema);

// Schema para paginação de avaliações
export const paginatedAvaliacaoSchema = z.object({
  data: z.array(avaliacaoSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Schema para resposta de avaliação individual
export const avaliacaoResponseSchema = z.object({
  success: z.boolean(),
  data: avaliacaoSchema,
});

// Schema para resposta de listagem de avaliações
export const avaliacoesResponseSchema = z.object({
  success: z.boolean(),
  data: paginatedAvaliacaoSchema,
});