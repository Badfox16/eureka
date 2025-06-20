"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/forms/LoginForm";
import { LoginFormValues } from "@/types/usuario";
import Image from "next/image";
import { SocialLinks } from "@/components/SocialLinks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ApiStatus } from "@/types/api";
import { primary } from "@/lib/colors";

export default function LoginPage() {  const { login, status, error, usuario } = useAuth();
  const router = useRouter();
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (usuario && status === ApiStatus.SUCCESS) {
      router.push('/dashboard');
    }
  }, [usuario, status, router]);

  const handleLogin = async (data: LoginFormValues) => {
    await login({
      email: data.email,
      password: data.password
    });
  };
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary-100/20 dark:to-primary-950/20">
      <div className="flex-1 flex flex-col md:flex-row overflow-auto">
        {/* Splash Illustration */}
        <div className="hidden md:flex w-full md:w-1/2 items-center justify-center p-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-primary-200/20 dark:from-primary-900/20 dark:to-primary-950/20" />
          <Image
            src="/login.svg"
            alt="Estudante Eureka"
            width={500}
            height={500}
            className="relative z-10 max-w-full h-auto drop-shadow-xl dark:brightness-90"
            priority
          />
        </div>
        {/* Login Form */}
        <main className="flex w-full md:w-1/2 items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md shadow-xl border-border bg-background/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-foreground">Entrar no Eureka</CardTitle>
              <div className="text-center text-muted-foreground text-sm mt-2 animate-fade-in">
                Bem-vindo(a)! Acesse sua conta e transforme sua jornada estudantil.
              </div>
            </CardHeader>
            <CardContent>
              <LoginForm 
                onSubmit={handleLogin} 
                status={status} 
                error={error} 
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
