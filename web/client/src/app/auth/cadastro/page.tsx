"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CadastroPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Eureka Logo" width={40} height={40} />
            <span className="text-2xl font-bold text-primary-600">Eureka</span>
          </Link>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">Crie sua conta</CardTitle>
            <CardDescription className="text-center">
              Junte-se ao Eureka para melhorar seus estudos
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <p className="text-center">Formulário de cadastro em desenvolvimento</p>
            <div className="mt-4 text-center">
              <Link href="/auth/login" className="text-primary-600 hover:underline">
                Já tem uma conta? Faça login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}