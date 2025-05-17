import { z } from 'zod';
import { baseResourceSchema } from './common.schema';

export const createProvinciaSchema = z.object({
  nome: z.string().min(4, 'Nome deve ter pelo menos 4 caracteres'),
  codigo: z.string().min(2, 'Código deve ter pelo menos 2 caracteres'),
  regiao: z.string().min(3, 'Região deve ter pelo menos 3 caracteres'),
});

export const updateProvinciaSchema = createProvinciaSchema.partial();

export const provinciaSchema = baseResourceSchema.merge(createProvinciaSchema);

export type CreateProvinciaInput = z.infer<typeof createProvinciaSchema>;
export type UpdateProvinciaInput = z.infer<typeof updateProvinciaSchema>;
export type ProvinciaResponse = z.infer<typeof provinciaSchema>;