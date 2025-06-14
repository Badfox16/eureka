import { jwtDecode } from 'jwt-decode';
import { TipoUsuario } from '@/types';
import Cookies from 'js-cookie';

// Exportando para ser acessível em outros módulos
export type TokenPayload = {
  id: string;
  email: string;
  tipo: TipoUsuario;
  exp: number;
  iat?: number; // Optional para compatibilidade com tokens existentes
};

// Configurações
const TOKEN_KEY = 'token'; // Usando o mesmo nome que o middleware espera
const TOKEN_EXPIRY_DAYS = 7; // Padrão: 7 dias para expiração do cookie

/**
 * Obtém o token dos cookies
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get(TOKEN_KEY) || null;
}

/**
 * Armazena o token nos cookies
 * @param token Token JWT
 * @param expiryDays Dias para expiração (opcional)
 */
export function setToken(token: any, expiryDays = TOKEN_EXPIRY_DAYS): void {
  if (typeof window === 'undefined') return;
  
  // Verificar se token é uma string válida
  if (typeof token !== 'string' || !token) {
    console.error('Erro: Token inválido fornecido para setToken:', token);
    return;
  }
  
  // Decodifica o token para obter a data de expiração
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    // Define a expiração do cookie para coincidir com a expiração do JWT
    const expiry = decoded.exp 
      ? new Date(decoded.exp * 1000) 
      : new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
    
    // Usar opções mais simples para evitar problemas
    Cookies.set(TOKEN_KEY, token, {
      expires: expiry,
      path: '/',
      // Remover opções que podem causar problemas em desenvolvimento
      // sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production'
    });
    
    // Verificar se o cookie foi definido
    console.log('Cookie definido?', !!Cookies.get(TOKEN_KEY));
  } catch (error) {
    console.error('Erro ao definir token:', error);
    // Fallback se não conseguir decodificar
    Cookies.set(TOKEN_KEY, token, { 
      expires: expiryDays,
      path: '/'
    });
  }
}

/**
 * Remove o token dos cookies
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  Cookies.remove(TOKEN_KEY, { path: '/' });
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    // Verifica se o token não expirou
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    removeToken(); // Remove token inválido
    return false;
  }
}

/**
 * Verifica se o token precisa ser renovado
 * @param marginMinutes Minutos de margem antes da expiração
 */
export function needsRefresh(marginMinutes = 30): boolean {
  const token = getToken();
  if (!token) return false;
  
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const expirationTime = decoded.exp * 1000;
    const refreshTime = expirationTime - (marginMinutes * 60 * 1000);
    
    return Date.now() > refreshTime;
  } catch {
    return false;
  }
}

/**
 * Obtém informações do usuário do token
 */
export function getUser(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;
  
  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    return null;
  }
}

/**
 * Verifica se o usuário tem a role necessária
 * @param requiredRole Tipo de usuário requerido
 */
export function hasRole(requiredRole: TipoUsuario): boolean {
  const user = getUser();
  if (!user) return false;
  
  // Se for admin, tem todas as permissões
  if (user.tipo === TipoUsuario.ADMIN) return true;
  
  // Caso contrário, verifica a role específica
  return user.tipo === requiredRole;
}