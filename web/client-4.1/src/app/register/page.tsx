"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RegisterForm from "@/components/forms/RegisterForm";
import { RegisterFormValues } from "@/types/usuario";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ApiStatus } from "@/types/api";

export default function RegisterPage() {  const { register, status, error, usuario } = useAuth();
  const router = useRouter();
  
  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (usuario && status === ApiStatus.SUCCESS) {
      router.push('/dashboard');
    }
  }, [usuario, status, router]);
  const handleRegister = async (data: RegisterFormValues) => {
    await register(data.nome, data.email, data.password);
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
        {/* Register Form */}
        <main className="flex w-full md:w-1/2 items-center justify-center bg-background min-h-screen py-12">
          <Card className="w-full max-w-md shadow-xl border-0 bg-primary-50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-orange-900">Criar conta no Eureka</CardTitle>
              <div className="text-center text-orange-800 text-sm mt-2 animate-fade-in">
                Junte-se à comunidade Eureka e potencialize seus estudos!
              </div>
            </CardHeader>
            <CardContent>
              <RegisterForm 
                onSubmit={handleRegister} 
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
