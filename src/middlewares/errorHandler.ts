import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Error as MongooseError } from 'mongoose';

interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  errors?: any[];
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err); // Log do erro para depuração

  let statusCode = 500; // Código de status padrão (Erro interno do servidor)
  let message = 'Erro interno do servidor'; // Mensagem de erro padrão
  let code: string | undefined; // Código de erro opcional
  let errors: any[] | undefined; // Array de erros detalhados (para validação, etc.)

  // 1. Tratamento de Erros de Validação do Zod
  if (err instanceof ZodError) {
    statusCode = 400; // Bad Request
    message = 'Erro de validação';
    errors = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  }

  // 2. Tratamento de Erros do Mongoose
  if (err instanceof MongooseError.ValidationError) {
    statusCode = 400; // Bad Request
    message = 'Erro de validação da base de dados';
    errors = Object.values(err.errors).map((e: any) => ({
      path: e.path,
      message: e.message,
    }));
  }

  if (err instanceof MongooseError.CastError) {
    statusCode = 400; // Bad Request
    message = 'ID inválido';
  }

  if (err instanceof MongooseError.DocumentNotFoundError) {
    statusCode = 404; // Not Found
    message = 'Recurso não encontrado';
  }

  if (err.code === 11000) { // Erro de duplicidade do Mongoose (unique index)
    statusCode = 409; // Conflict
    message = 'Recurso já existe';
    code = 'DUPLICATE_RESOURCE';
  }

  // 3. Tratamento de Erros Personalizados
  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    errors = err.errors;
  }

  // 4. Tratamento de Erros de Autenticação
  if (err.name === 'UnauthorizedError') {
    statusCode = 401; // Unauthorized
    message = 'Não autenticado';
  }

  if (err.name === 'ForbiddenError') {
    statusCode = 403; // Forbidden
    message = 'Não autorizado';
  }

  // 5. Tratamento de Erros Genéricos
  if (statusCode === 500) {
    message = 'Erro interno do servidor';
  }

  const errorResponse: ErrorResponse = {
    status: 'error',
    message,
    code,
    errors,
  };

  res.status(statusCode).json(errorResponse);
};

// Classe de Erro Personalizado (opcional, para usar nos controladores)
class CustomError extends Error {
  statusCode: number;
  code?: string;
  errors?: any[];

  constructor(message: string, statusCode: number, code?: string, errors?: any[]) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Object.setPrototypeOf(this, CustomError.prototype); // Necessário para instanceof
  }
}

export default errorHandler;