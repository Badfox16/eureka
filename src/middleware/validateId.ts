import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { objectIdSchema } from '../schemas/common.schema';

export const validateId = (paramName: string = 'id') => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params[paramName];
      
      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: `Parâmetro ${paramName} é obrigatório`
        });
      }
      
      // Valida se é um ObjectId válido
      objectIdSchema.parse(id);
      
      // Se a validação passar, continua para o próximo middleware
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: 'error',
          message: `ID inválido: ${req.params[paramName]}`
        });
      }
      
      return next(error);
    }
  };