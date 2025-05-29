"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

// Schema de validação do formulário
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

// Tipo derivado do schema
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    // Simulando um tempo de carregamento para melhor experiência de usuário
    setTimeout(() => {
      try {
        // Apenas para fins de mock, vamos simular um login bem-sucedido
        localStorage.setItem("userLoggedIn", "true");
        localStorage.setItem("userEmail", data.email);
        
        toast.success("Login realizado com sucesso!");
        
        // Redirecionar para a página inicial do estudante
        router.push("/dashboard");
      } catch (error) {
        console.error(error);
        toast.error("Falha ao fazer login. Verifique suas credenciais.");
      } finally {
        setIsLoading(false);
      }
    }, 1500); // Simulando um delay de 1.5 segundos
  };

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
            <CardTitle className="text-center text-2xl">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-center">
              Entre com seu email e senha para acessar sua conta
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </label>
                  <Link
                    href="/recuperar-senha"
                    className="text-xs text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-600 dark:border-slate-700 dark:bg-slate-800 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full rounded-md bg-primary-600 py-2 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm">
                Não tem uma conta?{" "}
                <Link
                  href="/cadastro"
                  className="text-primary-600 hover:underline dark:text-primary-400"
                >
                  Cadastre-se
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}