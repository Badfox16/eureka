import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Error as MongooseError } from 'mongoose';

interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  errors?: any[];
  debug?: any; // Apenas para ambiente não-produção
}

// Classe de Erro Personalizado para usar nos controladores
export class CustomError extends Error {
  statusCode: number;
  code?: string;
  errors?: any[];

  constructor(message: string, statusCode: number, code?: string, errors?: any[]) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Log apropriado ao ambiente
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${err.stack}`);
  } else {
    console.error(`[ERROR] ${err.name}: ${err.message}`);
  }

  let statusCode = 500;
  let message = 'Erro interno do servidor';
  let code: string | undefined;
  let errors: any[] | undefined;

  // 1. Tratamento de Erros de Validação do Zod
  if (err instanceof ZodError) {
    statusCode = 400; // Bad Request
    message = 'Erro de validação';
    code = 'VALIDATION_ERROR';
    errors = err.errors.map(e => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  }

  // 2. Tratamento de Erros do Mongoose
  else if (err instanceof MongooseError.ValidationError) {
    statusCode = 400; // Bad Request
    message = 'Erro de validação da base de dados';
    code = 'DB_VALIDATION_ERROR';
    errors = Object.values(err.errors).map((e: any) => ({
      path: e.path,
      message: e.message,
    }));
  }
  
  else if (err instanceof MongooseError.CastError) {
    statusCode = 400; // Bad Request
    message = `ID inválido para o campo '${err.path}'`;
    code = 'INVALID_ID';
  }
  
  else if (err instanceof MongooseError.DocumentNotFoundError) {
    statusCode = 404; // Not Found
    message = 'Recurso não encontrado';
    code = 'RESOURCE_NOT_FOUND';
  }
  
  // Erro de duplicidade do Mongoose (unique index)
  else if (err.code === 11000) { 
    statusCode = 409; // Conflict
    message = 'Recurso já existe';
    code = 'DUPLICATE_RESOURCE';
    
    // Tentar extrair o campo duplicado
    const field = Object.keys(err.keyPattern || {})[0];
    if (field) {
      message = `Já existe um registro com este ${field}`;
    }
  }
  
  // Erros de conexão com o MongoDB
  else if (err.name === 'MongoNetworkError') {
    statusCode = 503; // Service Unavailable
    message = 'Problema de conexão com o banco de dados';
    code = 'DB_CONNECTION_ERROR';
  }
  
  else if (err.name === 'MongoServerSelectionError') {
    statusCode = 503; // Service Unavailable
    message = 'Banco de dados indisponível';
    code = 'DB_UNAVAILABLE';
  }

  // 3. Tratamento de Erros Personalizados
  else if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    errors = err.errors;
  }

  // 4. Tratamento de Erros de Autenticação
  else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    statusCode = 401; // Unauthorized
    message = 'Não autenticado';
    code = 'UNAUTHORIZED';
  }
  
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401; // Unauthorized
    message = 'Sessão expirada';
    code = 'TOKEN_EXPIRED';
  }
  
  else if (err.name === 'ForbiddenError') {
    statusCode = 403; // Forbidden
    message = 'Não autorizado';
    code = 'FORBIDDEN';
  }
  
  // 5. Tratamento de Erro de Parsing JSON
  else if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'JSON inválido na requisição';
    code = 'INVALID_JSON';
  }
  
  // 6. Tratamento de Timeout
  else if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
    statusCode = 408; // Request Timeout
    message = 'A operação excedeu o tempo limite';
    code = 'TIMEOUT_ERROR';
  }

  // 7. Outros Erros Genéricos
  else if (err.message && err.message.includes('S3')) {
    const errorResponse = {
      message: 'Erro no serviço de armazenamento',
      code: 'S3_ERROR',
      status: 500,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    };
  }

  const errorResponse: ErrorResponse = {
    status: 'error',
    message,
    code,
    errors,
  };

  // Adicionar informações de contexto em ambiente de desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.debug = {
      stack: err.stack,
      request: {
        method: req.method,
        path: req.path,
        query: req.query,
      }
    };
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;