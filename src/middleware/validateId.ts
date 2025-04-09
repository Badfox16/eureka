import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { objectIdSchema } from '../schemas/common.schema';

export const validateId = (paramName: string = 'id'): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params[paramName];
      
      if (!id) {
        res.status(400).json({
          status: 'error',
          message: `Parâmetro ${paramName} é obrigatório`
        });
        return;
      }
      
      // Valida se é um ObjectId válido
      objectIdSchema.parse(id);
      
      // Se a validação passar, continua para o próximo middleware
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          status: 'error',
          message: `ID inválido: ${req.params[paramName]}`
        });
        return;
      }
      
      next(error);
    }
  };
};