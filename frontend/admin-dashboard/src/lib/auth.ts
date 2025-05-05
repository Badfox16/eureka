import { jwtDecode } from 'jwt-decode';
import { TipoUsuario } from '@/types';

type TokenPayload = {
  id: string;
  email: string;
  tipo: TipoUsuario;
  exp: number;
};

const TOKEN_KEY = 'eureka_auth_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  
  try {
    const payload = jwtDecode<TokenPayload>(token);
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getUser(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;
  
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}

export function hasRole(requiredRole: TipoUsuario): boolean {
  const user = getUser();
  if (!user) return false;
  
  if (requiredRole === TipoUsuario.ADMIN) {
    return user.tipo === TipoUsuario.ADMIN;
  }
  
  if (requiredRole === TipoUsuario.PROFESSOR) {
    return user.tipo === TipoUsuario.ADMIN || user.tipo === TipoUsuario.PROFESSOR;
  }
  
  return true;
}