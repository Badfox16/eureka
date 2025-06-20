"use client";

import { createContext, useContext, ReactNode } from 'react';
import { ApiStatus } from '@/types/api';
import { Usuario } from '@/types/usuario';
import { useAuth as useAuthHook } from '@/hooks/useAuth';

type AuthContextType = {
  usuario: Usuario | null;
  status: ApiStatus;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (nome: string, email: string, password: string, tipo?: string) => Promise<any>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { 
    usuario, 
    isAuthenticated, 
    isLoading, 
    isError, 
    error: authError, 
    login: loginFn, 
    register: registerFn, 
    logout: logoutFn 
  } = useAuthHook();

  // Converter status do React Query para ApiStatus
  let status = ApiStatus.IDLE;
  if (isLoading) status = ApiStatus.LOADING;
  else if (isError) status = ApiStatus.ERROR;
  else if (usuario) status = ApiStatus.SUCCESS;

  // Função de login
  const login = async (email: string, password: string) => {
    return loginFn({ email, password });
  };

  // Função de registro
  const register = async (nome: string, email: string, password: string, tipo?: string) => {
    return registerFn({ 
      nome, 
      email, 
      password, 
      tipo: tipo as any
    });
  };

  // Função de logout
  const logout = async () => {
    return logoutFn();
  };

  return (
    <AuthContext.Provider value={{ 
      usuario: usuario || null, 
      status, 
      error: authError?.message || null, 
      login, 
      register, 
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
