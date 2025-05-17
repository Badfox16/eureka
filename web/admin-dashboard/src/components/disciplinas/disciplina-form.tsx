"use client"

import { useState } from "react";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Disciplina } from "@/types/disciplina";
import { createDisciplinaSchema } from "@/schemas/disciplina.schema";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

// Interface para o formulário
interface FormValues {
  codigo: string;
  nome: string;
  descricao: string;
  ativo: boolean;
}

interface DisciplinaFormProps {
  title: string;
  disciplina?: Disciplina;
  onSubmit: (data: FormValues) => Promise<void>;
  trigger: React.ReactNode;
}

export function DisciplinaForm({ title, disciplina, onSubmit, trigger }: DisciplinaFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados individuais para cada campo do formulário
  const [formValues, setFormValues] = useState<FormValues>({
    codigo: disciplina?.codigo || "",
    nome: disciplina?.nome || "",
    descricao: disciplina?.descricao || "",
    ativo: disciplina?.ativo ?? true
  });
  
  // Erros de validação
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handlers para atualizar os valores do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro quando o campo é editado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handler para checkbox
  const handleCheckboxChange = (checked: boolean) => {
    setFormValues(prev => ({
      ...prev,
      ativo: checked
    }));
  };
  
  // Handler para código (uppercase)
  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFormValues(prev => ({
      ...prev,
      codigo: value
    }));
    // Limpar erro
    if (errors.codigo) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.codigo;
        return newErrors;
      });
    }
  };
  
  // Validar e enviar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar com Zod
      createDisciplinaSchema.parse(formValues);
      
      setIsSubmitting(true);
      await onSubmit(formValues);
      setOpen(false);
      
      // Resetar o formulário
      setFormValues({
        codigo: "",
        nome: "",
        descricao: "",
        ativo: true
      });
      setErrors({});
      
    } catch (error) {
      // Capturar erros de validação do Zod
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      console.error("Erro ao salvar disciplina:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para {disciplina ? "editar" : "criar"} uma disciplina.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                name="codigo"
                placeholder="Ex: MAT"
                maxLength={5}
                value={formValues.codigo}
                onChange={handleCodigoChange}
                className={errors.codigo ? "border-destructive" : ""}
              />
              {errors.codigo && (
                <p className="text-sm text-destructive">{errors.codigo}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Ex: Matemática"
                value={formValues.nome}
                onChange={handleChange}
                className={errors.nome ? "border-destructive" : ""}
              />
              {errors.nome && (
                <p className="text-sm text-destructive">{errors.nome}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              placeholder="Descreva a disciplina..."
              className={`resize-none ${errors.descricao ? "border-destructive" : ""}`}
              value={formValues.descricao}
              onChange={handleChange}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">{errors.descricao}</p>
            )}
          </div>
          
          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <Checkbox
              id="ativo"
              checked={formValues.ativo}
              onCheckedChange={handleCheckboxChange}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor="ativo">Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Disciplina disponível para uso no sistema
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {disciplina ? "Salvar alterações" : "Criar disciplina"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}