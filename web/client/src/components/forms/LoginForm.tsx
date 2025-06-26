"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { ApiStatus } from "@/types/api";
import { LoginFormValues, loginSchema } from "@/types/usuario";
import { primary, status } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  onSubmit: (data: LoginFormValues) => Promise<void>;
  status: ApiStatus;
  error?: string | null;
}

export default function LoginForm({ onSubmit, status, error }: LoginFormProps) {  const [showPassword, setShowPassword] = useState(false);
  // Adicionar uma variável de estado para controlar quando o formulário foi enviado
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });
    const isLoading = status === ApiStatus.LOADING;
  // Só mostrar mensagem de sucesso se o status for SUCCESS e o formulário tiver sido enviado
  const isSuccess = status === ApiStatus.SUCCESS && formSubmitted;
  return (
    <form className="space-y-6" onSubmit={handleSubmit((data) => {
      setFormSubmitted(true);
      onSubmit(data);
    })} aria-label="Formulário de login">
      <div className="flex flex-col gap-2 animate-fade-in">
        <label htmlFor="email" className="block text-sm font-semibold text-foreground">E-mail</label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-label="E-mail"
          disabled={isLoading}
          placeholder="seu@email.com"
          className={cn(
            "bg-background text-foreground placeholder:text-muted-foreground",
            errors.email ? "border-status-error focus:border-status-error" : "border-input"
          )}
          {...register("email")}
        />
        {errors.email && (
          <span className="text-xs text-status-error flex items-center gap-1 animate-fade-in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            {errors.email.message}
          </span>
        )}
      </div>
      
      <div className="flex flex-col gap-2 animate-fade-in">
        <label htmlFor="password" className="block text-sm font-semibold text-foreground">Senha</label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-label="Senha"
            disabled={isLoading}
            placeholder="••••••••"
            className={cn(
              "bg-background text-foreground placeholder:text-muted-foreground",
              errors.password ? "border-status-error focus:border-status-error" : "border-input"
            )}
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <span className="text-xs text-status-error flex items-center gap-1 animate-fade-in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            {errors.password.message}
          </span>
        )}
        <a href="#" className="text-xs text-primary-600 dark:text-primary-400 hover:underline mt-1 w-fit" tabIndex={0} aria-label="Esqueci minha senha">Esqueci minha senha?</a>
      </div>
      
      {error && (
        <div className="flex items-center justify-center gap-2 text-status-error text-sm text-center animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          {error}
        </div>
      )}
      
      {/* A mensagem de sucesso foi removida daqui para simplificar o fluxo.
          O redirecionamento agora é a única indicação de sucesso. */}
      
      <Button
        type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-2 dark:bg-primary-500 dark:hover:bg-primary-600"
        disabled={isLoading}
        aria-label="Entrar"
      >
        {isLoading && (
          <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        )}
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
      
      <div className="text-center text-sm mt-2 text-muted-foreground">
        Não tem conta? <a href="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Cadastre-se</a>
      </div>
      
      <div className="relative flex items-center my-4">
        <div className="flex-grow border-t border-border"></div>
        <span className="mx-2 text-xs text-muted-foreground">ou</span>
        <div className="flex-grow border-t border-border"></div>
      </div>
      
      <SocialLoginButtons disabled={isLoading} />
    </form>
  );
}
