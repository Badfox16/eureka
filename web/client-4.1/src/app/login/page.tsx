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

export default function LoginPage() {  const { login, status, error, usuario } = useAuth();
  const router = useRouter();
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (usuario && status === ApiStatus.SUCCESS) {
      router.push('/dashboard');
    }
  }, [usuario, status, router]);

  const handleLogin = async (data: LoginFormValues) => {
    await login(data.email, data.password);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col md:flex-row overflow-auto">
        {/* Splash Illustration */}
        <div className="hidden md:flex w-full md:w-1/2 bg-gradient-to-br from-primary-100 to-primary-50 items-center justify-center p-8">
          <Image
            src="/login.svg"
            alt="Estudante Eureka"
            width={400}
            height={400}
            className="max-w-full h-auto drop-shadow-xl"
            priority
          />
        </div>
        {/* Login Form */}
        <main className="flex w-full md:w-1/2 items-center justify-center bg-background min-h-screen py-12">
          <Card className="w-full max-w-md shadow-xl border-0 bg-primary-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-orange-900">Entrar no Eureka</CardTitle>
              <div className="text-center text-orange-800 text-sm mt-2 animate-fade-in">
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
      
      {/* Footer */}
      <footer className="w-full py-8 px-4 text-orange-950 bg-gradient-to-t from-orange-50 via-orange-100 to-orange-200 border-t border-orange-200 mt-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:justify-between gap-8 items-center">
          <div className="flex flex-col md:flex-row gap-8 w-full md:w-auto justify-center md:justify-start">
            <div className="min-w-[180px] text-left">
              <div className="font-bold text-lg mb-1 text-orange-900">Missão</div>
              <div className="text-xs text-orange-800 max-w-xs mb-2">
                Democratizar o acesso ao conhecimento, promovendo o crescimento estudantil com tecnologia, inovação e acolhimento.
              </div>
            </div>
            <div className="min-w-[180px] text-left">
              <div className="font-bold text-lg mb-1 text-orange-900">Visão</div>
              <div className="text-xs text-orange-800 max-w-xs mb-2">
                Ser referência em educação digital, inspirando estudantes a alcançarem seu potencial máximo.
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 mt-6 md:mt-0">
            <span className="text-xs text-orange-800 font-semibold">Siga nas redes:</span>
            <SocialLinks />
            <div className="text-[10px] text-orange-700 mt-2">&copy; {new Date().getFullYear()} Eureka. Todos os direitos reservados.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
