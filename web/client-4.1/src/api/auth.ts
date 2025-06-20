import { AuthResponse, LoginRequest, RegisterRequest, Usuario } from "../types/usuario";
import { fetchApi, getAuthToken } from "./apiService";

// URL base da API (importada do .env ou usa valor padrão)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eureka.edu.br';

// Funções de autenticação
export async function login(data: LoginRequest) {
  console.log('Iniciando login com email:', data.email);
  
  const response = await fetchApi<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  // Se autenticação bem-sucedida, salvar token
  if (response.data) {
    console.log('Login bem-sucedido, salvando tokens');
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('refresh_token', response.data.refreshToken);
  } else {
    console.warn('Login retornou resposta sem dados:', response);
  }
  
  return response;
}

export async function register(data: RegisterRequest) {
  console.log('Iniciando registro com email:', data.email);
  
  const response = await fetchApi<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  // Se registro bem-sucedido, salvar token
  if (response.data) {
    console.log('Registro bem-sucedido, salvando tokens');
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('refresh_token', response.data.refreshToken);
  } else {
    console.warn('Registro retornou resposta sem dados:', response);
  }
  
  return response;
}

export async function logout(): Promise<void> {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  
  try {
    await fetchApi('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Erro ao fazer logout na API:', error);
    // Continua com o logout local mesmo se a API falhar
  }
}

// Função para obter dados do usuário atual
export async function getCurrentUser() {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.log('getCurrentUser: Nenhum token disponível no localStorage');
    return {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Usuário não autenticado',
      },
    };
  }
  
  try {
    console.log('getCurrentUser: Tentando obter dados do usuário com token atual');
    // Tenta obter os dados do usuário
    const response = await fetchApi<{ status: string, data: { usuario: Usuario, estudante: any } }>('/auth/me');
    
    if (response.status === 'success' && response.data && response.data.usuario) {
      console.log('Usuário obtido com sucesso:', response.data.usuario);
      return {
        data: response.data.usuario
      };
    } else {
      console.error('Resposta da API não contém dados de usuário válidos:', response);
      return {
        error: {
          code: 'INVALID_RESPONSE',
          message: 'Resposta da API não contém dados de usuário válidos',
        },
      };
    }
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    
    // Verifica se é um erro de autenticação (401)
    if (
      error && 
      typeof error === 'object' && 
      'error' in error && 
      typeof error.error === 'object' &&
      error.error && 
      'code' in error.error &&
      (error.error.code === '401' || error.error.code === 401)
    ) {
      console.warn('Erro 401 em getCurrentUser, não tentando renovar token aqui pois fetchApi já deve ter tentado');
    }
    
    throw error;
  }
}
