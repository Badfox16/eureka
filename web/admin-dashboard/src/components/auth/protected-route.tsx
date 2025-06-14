"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { TipoUsuario } from "@/types";
import { Loader } from "@/components/ui/loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: TipoUsuario;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Verificar permissões se requiredRole for especificado
    if (
      !isLoading && 
      isAuthenticated && 
      requiredRole && 
      user && 
      !(user.tipo === TipoUsuario.ADMIN || user.tipo === requiredRole)
    ) {
      router.push("/dashboard");
      return;
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user && !(user.tipo === TipoUsuario.ADMIN || user.tipo === requiredRole)) {
    return null;
  }

  return <>{children}</>;
}