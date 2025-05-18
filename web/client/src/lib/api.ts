import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Adicionar interceptador para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o erro for 401 (Não autorizado) e não estamos na página de login
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const isAuthPage = window.location.pathname.includes("/login") || 
                         window.location.pathname.includes("/cadastro");
      
      if (!isAuthPage) {
        // Redirecionar para login
        window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(error);
  }
);

// Interceptador para adicionar token de autenticação a todas as requisições
api.interceptors.request.use(
  (config) => {
    // Você pode adicionar um token armazenado em cookie ou localStorage
    // Exemplo: config.headers.Authorization = `Bearer ${getToken()}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);