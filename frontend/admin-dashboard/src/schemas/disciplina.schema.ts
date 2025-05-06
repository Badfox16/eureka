import { z } from 'zod';
import { baseResourceSchema } from './common.schema';

// Schema para validar criação de disciplina
export const createDisciplinaSchema = z.object({
  codigo: z.string()
    .min(2, 'Código deve ter pelo menos 2 caracteres')
    .max(5, 'Código deve ter no máximo 5 caracteres')
    .toUpperCase(),
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  ativo: z.boolean().default(true)
});

// Schema para validar atualização de disciplina
export const updateDisciplinaSchema = createDisciplinaSchema.partial();

// Schema completo de disciplina
export const disciplinaSchema = baseResourceSchema.merge(createDisciplinaSchema);

// Tipos são definidos no arquivo types/disciplina.ts