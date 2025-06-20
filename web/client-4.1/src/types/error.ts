// Modelo de erro de validação
export type ErroValidacao = {
  campo: string;
  mensagem: string;
};

// Resposta de erro da API
export type ErrorResponse = {
  code: string;
  message: string;
  details?: Record<string, string[]>;
};

// Mantendo compatibilidade com o código existente
// até que seja totalmente refatorado
export type ValidationError = ErroValidacao;
