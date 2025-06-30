  // URL base da API (pode ser configurada em um arquivo .env)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eurekamz.tech';

// Prefixo da API
const API_PREFIX = '/v1';

// Opções padrão para requisições fetch
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Função auxiliar para requisições fetch com tratamento de erros
export async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit,
  retryCount: number = 0
): Promise<T> {
  try {    // Verificar e renovar o token se necessário antes de cada requisição
    await checkAndRefreshToken();
    
    // Usar as opções fornecidas ou criar novas com headers de autenticação
    const finalOptions = {
      ...defaultOptions,
      ...options,
    };
    
    // Sempre recria os headers com o token mais recente
    // Isso é crucial para garantir que estamos usando o token atualizado após renovação
    if (!finalOptions.headers || finalOptions.headers instanceof Headers) {
      // Se não há headers ou são do tipo Headers, substituir por nossos headers
      finalOptions.headers = createAuthHeaders();
    } else if (typeof finalOptions.headers === 'object') {
      // Se são headers em formato de objeto, garantir que tem Authorization
      const headersObj = finalOptions.headers as Record<string, string>;
      const token = localStorage.getItem('auth_token');
      if (token) {
        headersObj['Authorization'] = `Bearer ${token}`;
      }
    }    // Log para depuração
    console.log(`fetchApi: Iniciando requisição para ${endpoint} (método: ${finalOptions.method || 'GET'})`);
    
    const res = await fetch(`${API_URL}${API_PREFIX}${endpoint}`, finalOptions);
    
    console.log(`fetchApi: Resposta de ${endpoint} - Status: ${res.status}`);
    
    const data = await res.json();

    if (!res.ok) {
      // Se recebeu 401 Unauthorized e ainda não tentou retry
      if (res.status === 401 && retryCount < 1) {        console.log(`Recebeu 401 Unauthorized para endpoint ${endpoint}, tentando renovar token...`);
        
        // Forçar uma renovação de token e tentar novamente
        const newToken = await refreshToken();
        if (newToken) {
          console.log('Token renovado, tentando requisição novamente...');
          // Cria novas opções com o token atualizado
          const updatedOptions = {...options};
          // Remove os headers existentes para garantir que usaremos o novo token
          if (updatedOptions.headers) {
            delete updatedOptions.headers;
          }
          // Tenta a requisição novamente com o novo token
          return fetchApi<T>(endpoint, updatedOptions, retryCount + 1);
        } else {
          console.error('Falha ao renovar token, requisição será rejeitada com 401');
        }
      }
      
      throw {
        success: false,
        error: {
          code: res.status.toString(),
          message: data.message || 'Erro desconhecido',
          details: data.details,
        },
      };
    }

    return {
      success: true,
      ...data,
    } as T;
  } catch (error) {
    if (error && typeof error === 'object' && 'success' in error) {
      throw error;
    }
    throw {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
    };
  }
}

// Função auxiliar para criar headers de autenticação
export function createAuthHeaders(): Headers {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  
  // Obter o token mais recente diretamente do localStorage
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('Adicionando token aos headers:', token.substring(0, 15) + '...');
    headers.append('Authorization', `Bearer ${token}`);
  } else {
    console.log('Nenhum token disponível para adicionar aos headers');
  }
  
  return headers;
}

// Função para verificar e renovar o token se necessário
export async function checkAndRefreshToken(): Promise<void> {
  const token = localStorage.getItem('auth_token');
  
  // Se não há token, não há o que renovar
  if (!token) {
    console.log('Nenhum token encontrado no localStorage');
    return;
  }
  
  console.log('Verificando se o token precisa ser renovado...');
  
  // Se o token está expirado ou expirando em breve, tenta renovar
  if (isTokenExpiringSoon(token)) {
    console.log('Token está expirado ou expirando em breve, tentando renovar...');
    try {
      // Tentar renovar o token
      const newToken = await refreshToken();
      if (!newToken) {
        console.warn('Não foi possível renovar o token. Removendo tokens de autenticação.');
        // Se não conseguir renovar o token, limpar localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      } else {
        console.log('Token renovado com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      // Em caso de erro, limpar tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  } else {
    console.log('Token ainda é válido, não precisa renovar');
  }
}

// Função para renovar o token usando o refresh token
async function refreshToken(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.warn('Não há refresh token disponível para renovação');
      return null;
    }
    
    console.log('Tentando renovar token com refresh token...');
    
    // Usando o endpoint correto para refresh token conforme definido no backend
    const refreshUrl = `${API_URL}${API_PREFIX}/auth/refresh`;
    console.log(`Enviando refresh para: ${refreshUrl}`);
    
    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Envie apenas o refreshToken conforme o backend espera
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      console.error(`Falha ao renovar token. Status: ${response.status}`);
      throw new Error(`Falha ao renovar token. Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Resposta do refresh token:', data);
    
    if (data.data && data.data.token) {
      console.log('Token renovado com sucesso, salvando no localStorage');
      // Salvar o novo token e refresh token imediatamente
      localStorage.setItem('auth_token', data.data.token);
      if (data.data.refreshToken) {
        console.log('Salvando novo refresh token também');
        localStorage.setItem('refresh_token', data.data.refreshToken);
      }
      return data.data.token;
    } else {
      console.error('Resposta da API não contém token:', data);
      return null;
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    return null;
  }
}

// Função auxiliar para construir query strings
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Função para decodificar o token JWT
export function decodeToken(token: string): { exp?: number } | null {
  try {
    // Dividir o token em partes: header, payload, signature
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    // Decodificar a parte do payload
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
}

// Função para verificar se o token está prestes a expirar (dentro de 5 minutos) ou já expirou
export function isTokenExpiringSoon(token: string | null): boolean {
  if (!token) {
    console.log('isTokenExpiringSoon: Nenhum token fornecido');
    return true;
  }
  
  try {
    const decodedToken = decodeToken(token);
    if (!decodedToken || !decodedToken.exp) {
      console.warn('isTokenExpiringSoon: Token inválido ou sem informação de expiração');
      return true;
    }
    
    // Verificar se o token expira nos próximos 5 minutos ou já expirou
    const expirationTime = decodedToken.exp * 1000; // Converter para milissegundos
    const currentTime = Date.now();
    
    // Se o token já expirou, retorna true
    if (expirationTime <= currentTime) {
      console.log(`Token já expirado (expirou em ${new Date(expirationTime).toISOString()})`);
      return true;
    }
    
    // Se o token expira em menos de 5 minutos
    const timeUntilExpiration = expirationTime - currentTime;
    const isExpiringSoon = timeUntilExpiration < 5 * 60 * 1000; // 5 minutos em milissegundos
    
    if (isExpiringSoon) {
      console.log(`Token expirando em ${Math.floor(timeUntilExpiration / 1000)} segundos (${timeUntilExpiration}ms)`);
    } else {
      const minutesLeft = Math.floor(timeUntilExpiration / (60 * 1000));
      console.log(`Token ainda válido por ${minutesLeft} minutos`);
    }
    
    return isExpiringSoon;
  } catch (error) {
    console.error('Erro ao verificar expiração do token:', error);
    return true; // Em caso de erro, considera que precisa renovar
  }
}
