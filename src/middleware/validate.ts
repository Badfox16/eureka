import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { type AnyZodObject, ZodError } from 'zod';

/**
 * Middleware para validar dados de requisição usando schemas Zod
 * @param schema O schema Zod a ser usado para validação
 * @param source A propriedade da requisição onde os dados estão (body, query, params)
 */
export const validate = (
  schema: AnyZodObject, 
  source: 'body' | 'query' | 'params' = 'body'
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valida e transforma os dados com o schema fornecido
      const data = await schema.parseAsync(req[source]);
      
      // Substitui os dados originais com os dados validados e transformados
      req[source] = data;
      
      next();
    } catch (error) {
      // Se for um erro de validação do Zod, retorna uma resposta formatada
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Erro de validação',
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      
      // Para outros tipos de erro, passa para o próximo middleware de erro
      next(error);
    }
  };
};