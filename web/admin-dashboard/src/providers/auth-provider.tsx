"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getUserFromToken } from "@/lib/auth"
import { Usuario } from "@/types/usuario"

interface AuthContextType {
  user: Usuario | null
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function loadUserFromToken() {
      try {
        const userData = getUserFromToken()
        setUser(userData)
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserFromToken()
  }, [])

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}