"use client";

import { createContext, useContext, ReactNode } from 'react';
import { ApiStatus } from '@/types/api';
import { Usuario, LoginRequest, RegisterRequest, AuthResponse } from '@/types/usuario';
import { useAuth as useAuthHook } from '@/hooks/useAuth';

type AuthContextType = {
  usuario: Usuario | null;
  status: ApiStatus;
  error: string | null;
  login: (data: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  alterarSenha: (data: { senhaAtual: string; novaSenha: string; confirmarSenha: string }) => Promise<{ message: string }>;
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
    logout: logoutFn,
    alterarSenha: alterarSenhaFn
  } = useAuthHook();

  const value: AuthContextType = {
    usuario: usuario || null,
    status: isLoading ? ApiStatus.LOADING : isError ? ApiStatus.ERROR : usuario ? ApiStatus.SUCCESS : ApiStatus.IDLE,
    error: authError?.message || null,
    login: loginFn,
    register: registerFn,
    logout: logoutFn,
    isAuthenticated,
    alterarSenha: alterarSenhaFn
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
