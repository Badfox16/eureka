import { z } from 'zod';
import { baseResourceSchema } from './common.schema';

// Schema para validar criação de disciplina
export const createDisciplinaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  codigo: z.string().min(2, 'Código deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
});

// Schema para validar atualização de disciplina
export const updateDisciplinaSchema = createDisciplinaSchema.partial();

// Schema completo de disciplina
export const disciplinaSchema = baseResourceSchema.merge(createDisciplinaSchema);

// Tipos derivados do schema
export type CreateDisciplinaInput = z.infer<typeof createDisciplinaSchema>;
export type UpdateDisciplinaInput = z.infer<typeof updateDisciplinaSchema>;
export type DisciplinaResponse = z.infer<typeof disciplinaSchema>;