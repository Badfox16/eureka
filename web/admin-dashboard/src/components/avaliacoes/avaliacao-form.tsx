"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  TipoAvaliacao, 
  Trimestre, 
  Epoca, 
  VarianteProva, 
  AreaEstudo, 
  Avaliacao 
} from "@/types/avaliacao"
import { useDisciplinas } from "@/hooks/use-disciplinas"
import { useProvincias } from "@/hooks/use-provincias"
import { toast } from "sonner"
import { Save, X } from "lucide-react"

// Schema para validação de formulário
const avaliacaoFormSchema = z.object({
  tipo: z.nativeEnum(TipoAvaliacao),
  ano: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 1),
  disciplina: z.string().min(1, "Selecione uma disciplina"),
  classe: z.coerce.number().int().min(10).max(12),
  trimestre: z.nativeEnum(Trimestre).optional(),
  provincia: z.string().optional(),
  epoca: z.nativeEnum(Epoca).optional(),
  variante: z.nativeEnum(VarianteProva).optional(),
  areaEstudo: z.nativeEnum(AreaEstudo).optional(),
  titulo: z.string().max(200).optional(),
}).refine(data => {
  // Verificar se os campos específicos para cada tipo estão presentes
  if (data.tipo === TipoAvaliacao.AP) {
    return data.trimestre && data.provincia;
  } else if (data.tipo === TipoAvaliacao.EXAME) {
    return data.epoca !== undefined;
  }
  return true;
}, {
  message: "Preencha os campos específicos para o tipo de avaliação",
  path: ["tipo"]
});

type AvaliacaoFormValues = z.infer<typeof avaliacaoFormSchema>;

interface AvaliacaoFormProps {
  avaliacao?: Avaliacao;
  onSubmit: (data: AvaliacaoFormValues) => Promise<boolean>;
  trigger: React.ReactNode;
  title?: string;
}

export function AvaliacaoForm({ 
  avaliacao, 
  onSubmit, 
  trigger, 
  title = avaliacao ? "Editar Avaliação" : "Nova Avaliação" 
}: AvaliacaoFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Carregar disciplinas e províncias
  const { data: disciplinasData, isLoading: isLoadingDisciplinas } = useDisciplinas();
  const { data: provinciasData, isLoading: isLoadingProvincias } = useProvincias();

  const disciplinas = disciplinasData?.data || [];
  const provincias = provinciasData?.data || [];

  // Definir valores padrão para o formulário
  const defaultValues: Partial<AvaliacaoFormValues> = {
    tipo: TipoAvaliacao.EXAME,
    ano: new Date().getFullYear(),
    classe: 12,
    variante: VarianteProva.UNICA,
    areaEstudo: AreaEstudo.GERAL,
  };

  // Determinar valores iniciais com base na avaliação existente ou padrões
  const initialValues = avaliacao 
    ? {
        tipo: avaliacao.tipo as TipoAvaliacao,
        ano: avaliacao.ano,
        disciplina: typeof avaliacao.disciplina === 'string' 
          ? avaliacao.disciplina 
          : (avaliacao.disciplina as any)?._id,
        classe: avaliacao.classe,
        trimestre: avaliacao.trimestre as Trimestre,
        provincia: typeof avaliacao.provincia === 'string' 
          ? avaliacao.provincia 
          : (avaliacao.provincia as any)?._id,
        epoca: avaliacao.epoca as Epoca,
        variante: avaliacao.variante as VarianteProva || VarianteProva.UNICA,
        areaEstudo: avaliacao.areaEstudo as AreaEstudo || AreaEstudo.GERAL,
        titulo: avaliacao.titulo,
      } 
    : defaultValues;

  // Formulário com validação
  const form = useForm<AvaliacaoFormValues>({
    resolver: zodResolver(avaliacaoFormSchema),
    defaultValues: initialValues,
  });

  // Obter o valor atual do tipo para exibir campos específicos
  const tipoAvaliacao = form.watch("tipo");

  // Enviar formulário
  async function handleSubmit(values: AvaliacaoFormValues) {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(values);
      if (success) {
        toast.success(avaliacao ? "Avaliação atualizada com sucesso!" : "Avaliação criada com sucesso!");
        setOpen(false);
        form.reset();
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message || "Ocorreu um erro ao processar a operação."}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Avaliação</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        
                        // Limpar campos específicos ao mudar o tipo
                        if (value === TipoAvaliacao.AP) {
                          form.setValue("epoca", undefined);
                          if (!form.getValues("trimestre")) {
                            form.setValue("trimestre", Trimestre.PRIMEIRO);
                          }
                        } else if (value === TipoAvaliacao.EXAME) {
                          form.setValue("trimestre", undefined);
                          form.setValue("provincia", undefined);
                          if (!form.getValues("epoca")) {
                            form.setValue("epoca", Epoca.PRIMEIRA);
                          }
                        }
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={TipoAvaliacao.EXAME}>Exame Nacional</SelectItem>
                        <SelectItem value={TipoAvaliacao.AP}>Avaliação Provincial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="disciplina"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Disciplina</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoadingDisciplinas}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a disciplina" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingDisciplinas ? (
                          <SelectItem value="">Carregando...</SelectItem>
                        ) : (
                          disciplinas.map((disciplina) => (
                            <SelectItem key={disciplina._id} value={disciplina._id}>
                              {disciplina.nome}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a classe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="10">10ª Classe</SelectItem>
                        <SelectItem value="11">11ª Classe</SelectItem>
                        <SelectItem value="12">12ª Classe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Campos específicos para Avaliação Provincial */}
              {tipoAvaliacao === TipoAvaliacao.AP && (
                <>
                  <FormField
                    control={form.control}
                    name="trimestre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trimestre</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o trimestre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={Trimestre.PRIMEIRO}>1º Trimestre</SelectItem>
                            <SelectItem value={Trimestre.SEGUNDO}>2º Trimestre</SelectItem>
                            <SelectItem value={Trimestre.TERCEIRO}>3º Trimestre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="provincia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Província</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isLoadingProvincias}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a província" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingProvincias ? (
                              <SelectItem value="">Carregando...</SelectItem>
                            ) : (
                              provincias.map((provincia) => (
                                <SelectItem key={provincia._id} value={provincia._id}>
                                  {provincia.nome}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Campos específicos para Exame Nacional */}
              {tipoAvaliacao === TipoAvaliacao.EXAME && (
                <FormField
                  control={form.control}
                  name="epoca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Época</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a época" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Epoca.PRIMEIRA}>1ª Época</SelectItem>
                          <SelectItem value={Epoca.SEGUNDA}>2ª Época</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Campos opcionais */}
              <FormField
                control={form.control}
                name="variante"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Variante</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a variante" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={VarianteProva.UNICA}>Única</SelectItem>
                        <SelectItem value={VarianteProva.A}>Variante A</SelectItem>
                        <SelectItem value={VarianteProva.B}>Variante B</SelectItem>
                        <SelectItem value={VarianteProva.C}>Variante C</SelectItem>
                        <SelectItem value={VarianteProva.D}>Variante D</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="areaEstudo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área de Estudo</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a área" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={AreaEstudo.GERAL}>Geral</SelectItem>
                        <SelectItem value={AreaEstudo.CIENCIAS}>Ciências</SelectItem>
                        <SelectItem value={AreaEstudo.LETRAS}>Letras</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Salvando..." : avaliacao ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}