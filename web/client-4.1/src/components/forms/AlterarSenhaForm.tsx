"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { ApiStatus } from "@/types/api";
import { z } from "zod";

// Schema de validação para o formulário de alteração de senha
const alterarSenhaSchema = z.object({
  senhaAtual: z
    .string()
    .min(6, { message: 'Senha atual deve ter pelo menos 6 caracteres' }),
  novaSenha: z
    .string()
    .min(6, { message: 'Nova senha deve ter pelo menos 6 caracteres' })
    .max(100, { message: 'Nova senha não pode exceder 100 caracteres' }),
  confirmarSenha: z
    .string()
    .min(6, { message: 'Confirmação de senha deve ter pelo menos 6 caracteres' })
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

type AlterarSenhaFormValues = z.infer<typeof alterarSenhaSchema>;

interface AlterarSenhaFormProps {
  onSubmit: (data: { senhaAtual: string; novaSenha: string; confirmarSenha: string }) => Promise<void>;
  status: ApiStatus;
  error: string | null;
}

export default function AlterarSenhaForm({ onSubmit, status, error }: AlterarSenhaFormProps) {
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const form = useForm<AlterarSenhaFormValues>({
    resolver: zodResolver(alterarSenhaSchema),
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: ''
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  const handleFormSubmit = async (data: AlterarSenhaFormValues) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <div className="relative">
          <Input
            type={mostrarSenhaAtual ? "text" : "password"}
            placeholder="Senha atual"
            {...register("senhaAtual")}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {mostrarSenhaAtual ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.senhaAtual && (
          <p className="mt-1 text-sm text-red-600">
            {errors.senhaAtual.message}
          </p>
        )}
      </div>

      <div>
        <div className="relative">
          <Input
            type={mostrarNovaSenha ? "text" : "password"}
            placeholder="Nova senha"
            {...register("novaSenha")}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {mostrarNovaSenha ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.novaSenha && (
          <p className="mt-1 text-sm text-red-600">
            {errors.novaSenha.message}
          </p>
        )}
      </div>

      <div>
        <div className="relative">
          <Input
            type={mostrarConfirmacao ? "text" : "password"}
            placeholder="Confirmar nova senha"
            {...register("confirmarSenha")}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {mostrarConfirmacao ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmarSenha && (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmarSenha.message}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <Button
        type="submit"
        disabled={status === ApiStatus.LOADING}
        className="w-full"
      >
        {status === ApiStatus.LOADING ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Alterando senha...
          </>
        ) : (
          'Alterar Senha'
        )}
      </Button>

      {status === ApiStatus.SUCCESS && (
        <p className="text-sm text-green-600">
          Senha alterada com sucesso!
        </p>
      )}
    </form>
  );
}
