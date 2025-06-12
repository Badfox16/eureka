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
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Provincia } from "@/types/provincia";
import { createProvinciaSchema } from "@/schemas/provincia.schema";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

// Interface para o formulário
interface FormValues {
  nome: string;
  codigo: string;
  regiao: string;
}

interface ProvinciaFormProps {
  title: string;
  provincia?: Provincia;
  onSubmit: (data: FormValues) => Promise<void>;
  trigger: React.ReactNode;
}

export function ProvinciaForm({ title, provincia, onSubmit, trigger }: ProvinciaFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados individuais para cada campo do formulário
  const [formValues, setFormValues] = useState<FormValues>({
    nome: provincia?.nome || "",
    codigo: provincia?.codigo || "",
    regiao: provincia?.regiao || ""
  });
  
  // Erros de validação
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handlers para atualizar os valores do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  // Handler para região
  const handleRegiaoChange = (value: string) => {
    setFormValues(prev => ({
      ...prev,
      regiao: value
    }));
    // Limpar erro
    if (errors.regiao) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.regiao;
        return newErrors;
      });
    }
  };
  
  // Validar e enviar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar com Zod
      createProvinciaSchema.parse(formValues);
      
      setIsSubmitting(true);
      await onSubmit(formValues);
      setOpen(false);
      
      // Resetar o formulário
      setFormValues({
        nome: "",
        codigo: "",
        regiao: ""
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
      console.error("Erro ao salvar província:", error);
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
            Preencha os campos abaixo para {provincia ? "editar" : "criar"} uma província.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Ex: Luanda"
                value={formValues.nome}
                onChange={handleChange}
                className={errors.nome ? "border-destructive" : ""}
              />
              {errors.nome && (
                <p className="text-sm text-destructive">{errors.nome}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                name="codigo"
                placeholder="Ex: LDA"
                maxLength={5}
                value={formValues.codigo}
                onChange={handleCodigoChange}
                className={errors.codigo ? "border-destructive" : ""}
              />
              {errors.codigo && (
                <p className="text-sm text-destructive">{errors.codigo}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="regiao">Região</Label>
            <Select 
              value={formValues.regiao} 
              onValueChange={handleRegiaoChange}
            >
              <SelectTrigger 
                id="regiao" 
                className={errors.regiao ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Selecione a região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Norte">Norte</SelectItem>
                <SelectItem value="Centro">Centro</SelectItem>
                <SelectItem value="Sul">Sul</SelectItem>
              </SelectContent>
            </Select>
            {errors.regiao && (
              <p className="text-sm text-destructive">{errors.regiao}</p>
            )}
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
              {provincia ? "Salvar alterações" : "Criar província"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}