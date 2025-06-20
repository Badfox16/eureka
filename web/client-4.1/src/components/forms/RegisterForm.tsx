"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { ApiStatus } from "@/types/api";
import { RegisterFormValues, registerSchema } from "@/types/usuario";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => Promise<void>;
  status: ApiStatus;
  error?: string | null;
}

export default function RegisterForm({ onSubmit, status, error }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });
  
  const isLoading = status === ApiStatus.LOADING;
  const isSuccess = status === ApiStatus.SUCCESS;

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} aria-label="Formulário de cadastro">
      <div className="flex flex-col gap-2 animate-fade-in">        <label htmlFor="nome" className="block text-sm font-medium mb-1 text-orange-900">Nome completo</label>
        <Input
          id="nome"
          type="text"
          autoComplete="name"
          aria-label="Nome completo"
          disabled={isLoading}
          placeholder="Seu nome"
          className={errors.nome ? "border-red-400 focus:border-red-500" : ""}
          {...register("nome")}
        />
        {errors.nome && (
          <span className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            {errors.nome.message}
          </span>
        )}
      </div>
      
      <div className="flex flex-col gap-2 animate-fade-in">
        <label htmlFor="email" className="block text-sm font-medium mb-1 text-orange-900">E-mail</label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-label="E-mail"
          disabled={isLoading}
          placeholder="seu@email.com"
          className={errors.email ? "border-red-400 focus:border-red-500" : ""}
          {...register("email")}
        />
        {errors.email && (
          <span className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            {errors.email.message}
          </span>
        )}
      </div>
      
      <div className="flex flex-col gap-2 animate-fade-in">
        <label htmlFor="password" className="block text-sm font-medium mb-1 text-orange-900">Senha</label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            aria-label="Senha"
            disabled={isLoading}
            placeholder="Crie uma senha"
            className={errors.password ? "border-red-400 focus:border-red-500" : ""}
            {...register("password")}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600 p-1"
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => setShowPassword(v => !v)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <span className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            {errors.password.message}
          </span>
        )}
      </div>
      
      {error && (
        <div className="flex items-center justify-center gap-2 text-red-600 text-sm text-center animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          {error}
        </div>
      )}
      
      {isSuccess && (
        <div className="flex items-center justify-center gap-2 text-green-600 text-sm text-center animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span>Cadastro realizado com sucesso!</span>
        </div>
      )}
      
      <Button
        type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2"
        disabled={isLoading}
        aria-label="Cadastrar"
      >
        {isLoading && (
          <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        )}
        {isLoading ? "Cadastrando..." : "Cadastrar"}
      </Button>
      
      <div className="text-center text-sm mt-2">
        Já tem conta? <a href="/login" className="text-orange-600 underline">Entrar</a>
      </div>
      
      <div className="relative flex items-center my-4">
        <div className="flex-grow border-t border-orange-200"></div>
        <span className="mx-2 text-xs text-orange-400">ou</span>
        <div className="flex-grow border-t border-orange-200"></div>
      </div>
      
      <SocialLoginButtons disabled={isLoading} />
    </form>
  );
}
