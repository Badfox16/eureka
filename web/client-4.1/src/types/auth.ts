import { Usuario } from "./usuario";

// Tipos para requisições de autenticação
export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  nome: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  usuario: Usuario;
  token: string;
};
