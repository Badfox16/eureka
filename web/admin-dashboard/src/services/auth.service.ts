import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/config/api';
import { Usuario } from '@/types';
import { getToken, removeToken, setToken } from '@/lib/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: Usuario;
}

class AuthService {
  /**
   * Realiza o login do usuário
   * @param credentials Credenciais de login (email e senha)
   * @returns Resposta de autenticação com token e dados do usuário
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      // Acessar o token corretamente da estrutura de resposta
      // O token está aninhado dentro de response.data
      if (!response || !response.data) {
        console.error('Resposta inválida da API:', response);
        throw new Error('Resposta inválida do servidor');
      }
      
      const { token, refreshToken, usuario } = response.data;
      
      if (!token || typeof token !== 'string') {
        console.error('Token inválido na resposta:', response);
        throw new Error('Token inválido recebido do servidor');
      }
      
      // Armazenar o token
      this.storeToken(token);
      
      // Armazenar o refresh token, se disponível
      if (refreshToken && typeof refreshToken === 'string') {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Retornar uma resposta formatada corretamente
      return {
        token,
        user: usuario
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  /**
   * Realiza o logout do usuário
   * @returns void
   */
  async logout(): Promise<void> {
    if (getToken()) {
      try {
        await apiClient(ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
      } catch (error) {
        // Mesmo com erro no servidor, faremos logout local
      }
    }
    // Sempre removemos o token local independentemente do resultado
    removeToken();
  }

  /**
   * Obtém as informações do usuário atual
   * @returns Dados do usuário logado
   */
  async getCurrentUser(): Promise<Usuario> {
    return apiClient<Usuario>(ENDPOINTS.AUTH.ME);
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns true se o usuário estiver autenticado
   */
  isAuthenticated(): boolean {
    return !!getToken();
  }

  /**
   * Armazena o token de autenticação
   * @param token Token JWT
   */
  storeToken(token: string): void {
    // Adicionar log para depuração
    console.log('Armazenando token:', token ? token.substring(0, 10) + '...' : 'null');
    
    // Limpar qualquer token existente
    removeToken();
    
    // Armazenar o novo token
    setToken(token);
    
    // Verificar se o token foi armazenado corretamente
    setTimeout(() => {
      const storedToken = getToken();
      console.log('Token armazenado?', !!storedToken);
    }, 100);
  }

  storeUserInfo(user: Usuario): void {
    if (typeof window === 'undefined') return;
    
    // Armazenar as informações do usuário em localStorage
    localStorage.setItem('user_info', JSON.stringify({
      id: user._id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo // Cargo/role do usuário
    }));
  }

  getUserInfo(): { nome: string; tipo: string } | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userInfo = localStorage.getItem('user_info');
      if (!userInfo) return null;
      
      const parsed = JSON.parse(userInfo);
      return {
        nome: parsed.nome,
        tipo: parsed.tipo
      };
    } catch {
      return null;
    }
  }

  /**
   * Remove o token de autenticação
   */
  removeToken(): void {
    removeToken();
  }
}

export const authService = new AuthService();