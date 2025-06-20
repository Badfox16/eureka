import { AuthResponse, LoginRequest, RegisterRequest, Usuario } from "../types/usuario";
import { fetchApi, createAuthHeaders, getAuthToken } from "./apiService";

// Funções de autenticação
export async function login(data: LoginRequest) {
  const response = await fetchApi<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  // Se autenticação bem-sucedida, salvar token
  if (response.data) {
    localStorage.setItem('auth_token', response.data.token);
  }
  
  return response;
}

export async function register(data: RegisterRequest) {
  const response = await fetchApi<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  // Se registro bem-sucedido, salvar token
  if (response.data) {
    localStorage.setItem('auth_token', response.data.token);
  }
  
  return response;
}

export async function logout(): Promise<void> {
  localStorage.removeItem('auth_token');  // Pode também fazer uma chamada à API para invalidar o token
  await fetchApi('/auth/logout', {
    method: 'POST',
    headers: createAuthHeaders(),
  });
}

// Função para obter dados do usuário atual
export async function getCurrentUser() {
  const token = getAuthToken();
  
  if (!token) {
    return {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Usuário não autenticado',
      },
    };
  }
    return fetchApi<Usuario>('/auth/me', {
    headers: createAuthHeaders(),
  });
}
