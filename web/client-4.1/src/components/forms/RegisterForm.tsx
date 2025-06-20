"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { ApiStatus } from "@/types/api";
import { RegisterFormValues, registerSchema } from "@/lib/validations";
import { cn } from "@/lib/utils";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => Promise<void>;
  status: ApiStatus;
  error?: string | null;
}

// Lista de províncias de Moçambique
const provincias = [
  "Maputo",
  "Gaza",
  "Inhambane",
  "Manica",
  "Sofala",
  "Tete",
  "Zambézia",
  "Nampula",
  "Cabo Delgado",
  "Niassa"
];

// Lista de classes válidas (10-12)
const classes = [10, 11, 12];

export default function RegisterForm({ onSubmit, status, error }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });  const isLoading = status === ApiStatus.LOADING;
  // Adicionar uma variável de estado para controlar quando o formulário foi enviado
  const [formSubmitted, setFormSubmitted] = useState(false);
  // Só mostrar mensagem de sucesso se o status for SUCCESS e o formulário tiver sido enviado
  const isSuccess = status === ApiStatus.SUCCESS && formSubmitted;

  // Função para formatar o texto da classe
  const formatarClasse = (classe: number) => {
    if (classe === 10) return "10ª Classe";
    return `${classe}ª Classe`;
  };
  return (
    <form className="space-y-6" onSubmit={handleSubmit((data) => {
      setFormSubmitted(true);
      onSubmit(data);
    })} aria-label="Formulário de cadastro">
      <div className="flex flex-col gap-2 animate-fade-in">
        <label htmlFor="nome" className="block text-sm font-semibold text-foreground">Nome completo</label>
        <Input
          id="nome"
          type="text"
          autoComplete="name"
          aria-label="Nome completo"
          disabled={isLoading}
          placeholder="Seu nome completo"
          className={cn(
            "bg-background text-foreground placeholder:text-muted-foreground",
            errors.nome ? "border-status-error focus:border-status-error" : "border-input"
          )}
          {...register("nome")}
        />
        {errors.nome && (
          <span className="text-xs text-status-error flex items-center gap-1 animate-fade-in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            {errors.nome.message}
          </span>
        )}
      </div>

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
        <label htmlFor="classe" className="block text-sm font-semibold text-foreground">Classe</label>
        <Select
          disabled={isLoading}
          onValueChange={(value) => setValue('classe', parseInt(value))}
        >
          <SelectTrigger
            id="classe"
            className={cn(
              "bg-background text-foreground",
              errors.classe ? "border-status-error focus:border-status-error" : "border-input"
            )}
          >
            <SelectValue placeholder="Selecione sua classe" />
          </SelectTrigger>          <SelectContent
            className="bg-white text-foreground border-border shadow-md dark:bg-zinc-900 dark:text-zinc-100"
          >
            {classes.map((classe) => (
              <SelectItem
                key={classe}
                value={classe.toString()}
                className="bg-white text-foreground dark:bg-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
              >
                {formatarClasse(classe)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.classe && (
          <span className="text-xs text-status-error flex items-center gap-1 animate-fade-in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            {errors.classe.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 animate-fade-in">
        <label htmlFor="provincia" className="block text-sm font-semibold text-foreground">Província (opcional)</label>
        <Select
          disabled={isLoading}
          onValueChange={(value) => setValue('provincia', value)}
        >
          <SelectTrigger
            id="provincia"
            className={cn(
              "bg-background text-foreground",
              errors.provincia ? "border-status-error focus:border-status-error" : "border-input"
            )}
          >
            <SelectValue placeholder="Selecione sua província" />
          </SelectTrigger>          <SelectContent
            className="bg-white text-foreground border-border shadow-md dark:bg-zinc-900 dark:text-zinc-100"
          >
            {provincias.map((provincia) => (
              <SelectItem
                key={provincia}
                value={provincia}
                className="bg-white text-foreground dark:bg-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:bg-zinc-100 dark:focus:bg-zinc-800 data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
              >
                {provincia}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.provincia && (
          <span className="text-xs text-status-error flex items-center gap-1 animate-fade-in">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
            {errors.provincia.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 animate-fade-in">
        <label htmlFor="password" className="block text-sm font-semibold text-foreground">Senha</label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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
      </div>

      {error && (
        <div className="flex items-center justify-center gap-2 text-status-error text-sm text-center animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          {error}
        </div>
      )}

      {isSuccess && (
        <div className="flex items-center justify-center gap-2 text-status-success text-sm text-center animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span>Cadastro realizado com sucesso!</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-2 dark:bg-primary-500 dark:hover:bg-primary-600"
        disabled={isLoading}
        aria-label="Cadastrar"
      >
        {isLoading && (
          <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        )}
        {isLoading ? "Cadastrando..." : "Cadastrar"}
      </Button>

      <div className="text-center text-sm mt-2">
        Já tem conta? <a href="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Faça login</a>
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
