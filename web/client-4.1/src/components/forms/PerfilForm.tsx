"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ApiStatus } from "@/types/api";
import { z } from "zod";
import { Estudante } from "@/types/estudante";
import { cn } from "@/lib/utils";

// Schema de validação para o formulário de perfil
const perfilSchema = z.object({
  nome: z
    .string()
    .min(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'Nome não pode exceder 100 caracteres' }),
  email: z
    .string()
    .min(1, { message: 'E-mail é obrigatório' })
    .email({ message: 'E-mail inválido' }),
  classe: z
    .string()
    .min(1, { message: 'Classe é obrigatória' }),
  escola: z
    .string()
    .min(3, { message: 'Nome da escola deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'Nome da escola não pode exceder 100 caracteres' }),
  provincia: z
    .string()
    .min(1, { message: 'Província é obrigatória' }),
});

type PerfilFormData = z.infer<typeof perfilSchema>;

interface PerfilFormProps {
  estudante: Estudante;
  provincias: Array<{ _id: string; nome: string; }>;
  onSubmit: (data: PerfilFormData) => Promise<void>;
  status?: ApiStatus;
  error?: string | null;
}

export function PerfilForm({ estudante, provincias, onSubmit, status, error }: PerfilFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(error || null);
  
  const { 
    register, 
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: estudante?.nome || '',
      email: estudante?.email || '',
      classe: estudante?.classe?.toString() || '',
      escola: estudante?.escola || '',
      provincia: estudante?.provincia || '',
    }
  });

  const handlePerfilSubmit = async (formData: PerfilFormData) => {
    try {
      setSubmitError(null);
      await onSubmit({
        ...formData,
        classe: formData.classe,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao atualizar perfil');
    }
  };

  const handleSelectChange = (name: keyof PerfilFormData, value: string) => {
    setValue(name, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <form onSubmit={handleSubmit(handlePerfilSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-medium">
          Nome Completo
        </label>
        <Input
          id="nome"
          type="text"
          {...register('nome')}
          className={cn(errors.nome && "border-destructive focus:ring-destructive")}
          placeholder="Seu nome completo"
        />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className={cn(errors.email && "border-destructive focus:ring-destructive")}
          placeholder="seu.email@exemplo.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="classe" className="text-sm font-medium">
          Classe
        </label>
        <Select 
          onValueChange={(value) => handleSelectChange('classe', value)} 
          defaultValue={estudante?.classe?.toString()}
          name="classe"
        >
          <SelectTrigger className={cn(errors.classe && "border-destructive focus:ring-destructive")}>
            <SelectValue placeholder="Selecione sua classe" />
          </SelectTrigger>
          <SelectContent>
            {[...Array(5)].map((_, i) => (
              <SelectItem key={i+8} value={(i+8).toString()}>
                {i+8}ª Classe
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.classe && (
          <p className="text-sm text-destructive">{errors.classe.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="escola" className="text-sm font-medium">
          Escola
        </label>
        <Input
          id="escola"
          type="text"
          {...register('escola')}
          className={cn(errors.escola && "border-destructive focus:ring-destructive")}
          placeholder="Nome da sua escola"
        />
        {errors.escola && (
          <p className="text-sm text-destructive">{errors.escola.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="provincia" className="text-sm font-medium">
          Província
        </label>
        <Select 
          onValueChange={(value) => handleSelectChange('provincia', value)} 
          defaultValue={estudante?.provincia}
          name="provincia"
        >
          <SelectTrigger className={cn(errors.provincia && "border-destructive focus:ring-destructive")}>
            <SelectValue placeholder="Selecione sua província" />
          </SelectTrigger>
          <SelectContent>
            {provincias.map((provincia) => (
              <SelectItem key={provincia._id} value={provincia._id}>
                {provincia.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.provincia && (
          <p className="text-sm text-destructive">{errors.provincia.message}</p>
        )}
      </div>

      {submitError && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {submitError}
        </div>
      )}

      {status === 'success' && (
        <div className="bg-success/10 text-success p-3 rounded-md text-sm">
          Perfil atualizado com sucesso!
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
        variant={isSubmitting ? "outline" : "default"}
      >
        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </form>
  );
}
