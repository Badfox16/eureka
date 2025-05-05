import { z } from 'zod';
import { Types } from 'mongoose';

// Helper para validar ObjectIds do MongoDB
export const objectIdSchema = z.string().refine(
  (value) => Types.ObjectId.isValid(value),
  {
    message: 'ID inválido',
  }
);

// Schema base para todos os recursos com timestamp
export const baseResourceSchema = z.object({
  _id: objectIdSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Schema comum para paginação
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

// Schema para respostas de erro
export const errorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

// Enums compartilhados
export const classeSchema = z.enum(['11', '12']).transform(Number);