"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { isAuthenticated, getUser } from "@/lib/auth"
import { Usuario } from "@/types/usuario"
import { authService } from "@/services/auth.service"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface AuthContextType {
  user: Usuario | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

// Exportamos o AuthContext para ser acessível em outros arquivos
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  logout: async () => {},
  checkSession: async () => {},
})

// Definimos o hook useAuth aqui para evitar referência circular
export const useAuth = () => useContext(AuthContext)

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  // Verifica se a rota atual precisa de autenticação
  const isPublicRoute = publicRoutes.includes(pathname || '')
  
  // Função para verificar sessão
  const checkSession = async () => {
    try {
      setIsLoading(true)
      
      // Verifica se o token é válido
      if (!isAuthenticated()) {
        setUser(null)
        if (!isPublicRoute) {
          router.push('/auth/login')
        }
        return
      }
      
      // Obtém os dados básicos do usuário do token
      const tokenUser = getUser()
      
      // Se tivermos um usuário básico do token, definimos temporariamente
      if (tokenUser) {
        setUser({ 
          _id: tokenUser.id,
          email: tokenUser.email,
          tipo: tokenUser.tipo,
          nome: '', // Será atualizado ao buscar do servidor
          // Outros campos obrigatórios com valores padrão
          ativo: true,
        } as Usuario)
      }
      
      try {
        // Busca os dados completos do usuário da API
        const userData = await authService.getCurrentUser()
        setUser(userData)
        queryClient.setQueryData(['user'], userData)
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
        // Se falhar ao buscar dados completos, mantém os dados básicos do token
        // ou faz logout se for um erro de autenticação (401)
        if ((error as any)?.status === 401) {
          await logout()
        }
      }
    } catch (error) {
      console.error("Erro ao verificar sessão:", error)
      setUser(null)
      if (!isPublicRoute) {
        router.push('/auth/login')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await authService.login({ email, password })
      authService.storeToken(response.token)
      
      // Se a resposta incluir dados do usuário
      if (response.user) {
        setUser(response.user)
        queryClient.setQueryData(['user'], response.user)
      } else {
        // Se não incluir, busque o usuário atual
        await checkSession()
      }
      
      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
      return true
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      toast.error((error as Error)?.message || 'Falha ao realizar login')
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Função de logout
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      await authService.logout()
      queryClient.clear()
      setUser(null)
      router.push('/auth/login')
      toast.success('Logout realizado com sucesso')
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast.error('Erro ao realizar logout')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Verificar autenticação ao montar o componente
  useEffect(() => {
    checkSession()
    
    // Adicionar um intervalo para verificar a sessão periodicamente
    const interval = setInterval(() => {
      if (!isLoading && !isPublicRoute) {
        checkSession()
      }
    }, 5 * 60 * 1000) // Verificar a cada 5 minutos
    
    return () => clearInterval(interval)
  }, [pathname])
  
  // Redirecionar se necessário com base na autenticação
  useEffect(() => {
    if (!isLoading) {
      if (!user && !isPublicRoute) {
        router.push('/auth/login')
      } else if (user && isPublicRoute) {
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, pathname])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}