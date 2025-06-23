"use client"

import { useState, useRef } from "react"
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle, Trash2, Upload, AlertCircle, X, Image as ImageIcon } from "lucide-react"
import { createQuestaoSchema, updateQuestaoSchema } from "@/schemas/questao.schema"
import { QuestaoForm as QuestaoFormValues, Questao } from "@/types/questao"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuestaoImageUpload } from "@/hooks/use-questao-image-upload"

// Atualizar a definição da interface para incluir as propriedades necessárias
interface QuestaoFormProps {
  avaliacaoId: string;
  questao?: Questao;
  isEditing?: boolean;
  title?: string;
  onSubmit: (data: QuestaoFormValues) => Promise<void>;
  trigger?: React.ReactNode;
  
  // Adicionar estas propriedades explicitamente
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  
  // Funções para upload de imagens
  onImageUpload?: (file: File) => Promise<string>;
  onEnunciadoImageUpload?: (file: File) => Promise<string>;
  onAlternativaImageUpload?: (file: File, letra: string) => Promise<string>;
}

// Letras das alternativas
const LETRAS_ALTERNATIVAS = ["A", "B", "C", "D"]

export function QuestaoForm({
  avaliacaoId,
  questao,
  isEditing = false,
  title = "Questão",
  onSubmit,
  trigger,
  isOpen,
  onOpenChange
}: QuestaoFormProps) {
  // Estado interno (usado quando isOpen não é fornecido)
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Determinamos qual estado usar para controlar o diálogo
  const dialogOpen = isOpen !== undefined ? isOpen : internalOpen
  const handleDialogOpenChange = onOpenChange || setInternalOpen
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState<string | null>(null)
  
  // Apenas uma ref para o enunciado
  const enunciadoImageInputRef = useRef<HTMLInputElement>(null)
  
  // Criar um ref para o formulário
  const formRef = useRef<HTMLFormElement>(null);

  // Usar hook de upload de imagens
  const { 
    uploadEnunciadoImage,
    uploadAlternativaImage, 
    isUploadingEnunciado,
    isUploadingAlternativa 
  } = useQuestaoImageUpload({
    questaoId: questao?._id,
    useTempUpload: !questao
  })
  
  // Determinar se estamos editando ou criando
  const isEdit = !!questao

  // Extrair o ID da avaliação do objeto questão, se for um objeto populado
  const avaliacaoFromQuestao = typeof questao?.avaliacao === 'object' 
    ? questao?.avaliacao._id 
    : questao?.avaliacao

  // Configurar o formulário com React Hook Form e Zod
  const form = useForm<QuestaoFormValues>({
    resolver: zodResolver(isEdit ? updateQuestaoSchema : createQuestaoSchema) as any,
    defaultValues: {
      numero: questao?.numero || 1,
      enunciado: questao?.enunciado || "",
      alternativas: questao?.alternativas?.map(alt => ({
        letra: alt.letra,
        texto: alt.texto,
        correta: alt.correta,
        imagemUrl: alt.imagemUrl
      })) || [
        { letra: "A", texto: "", correta: true },
        { letra: "B", texto: "", correta: false },
        { letra: "C", texto: "", correta: false },
        { letra: "D", texto: "", correta: false }
      ],
      explicacao: questao?.explicacao || "",
      imagemEnunciadoUrl: questao?.imagemEnunciadoUrl || "",
      avaliacao: avaliacaoId || avaliacaoFromQuestao || "",
      valor: questao?.valor || 0.5
    }
  })

  // Hook para gerenciar o array de alternativas
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "alternativas"
  })

  // Gerenciar a alternativa correta
  const handleCorrectChange = (index: number) => {
    // Atualizar todas as alternativas para não corretas
    const alternativas = form.getValues().alternativas.map((alt, i) => ({
      ...alt,
      correta: i === index
    }))
    
    // Atualizar o formulário
    form.setValue("alternativas", alternativas)
  }

  // Adicionar uma nova alternativa
  const addAlternativa = () => {
    if (fields.length >= 5) return // Limite de 5 alternativas
    
    append({
      letra: LETRAS_ALTERNATIVAS[fields.length],
      texto: "",
      correta: false
    })
  }

  // Remover alternativa
  const removeAlternativa = (index: number) => {
    if (fields.length <= 3) return // Mínimo de 3 alternativas
    
    // Se a alternativa removida for a correta, marcar a primeira como correta
    const alternativas = form.getValues().alternativas
    const isRemovingCorrect = alternativas[index].correta
    
    remove(index)
    
    if (isRemovingCorrect && alternativas.length > 0) {
      const newAlternativas = form.getValues().alternativas.map((alt, i) => ({
        ...alt,
        correta: i === 0
      }))
      form.setValue("alternativas", newAlternativas)
    }
  }

  // Upload de imagem para o enunciado
  const handleEnunciadoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    
    try {
      setUploadingImage("enunciado")
      const imageUrl = await uploadEnunciadoImage(file)
      form.setValue("imagemEnunciadoUrl", imageUrl)
      setUploadingImage(null)
    } catch (err: any) {
      setError(`Erro ao fazer upload da imagem: ${err.message}`)
      setUploadingImage(null)
    }
  }

  // Upload de imagem para alternativa
  const handleAlternativaImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    const letra = LETRAS_ALTERNATIVAS[index]
    
    try {
      setUploadingImage(`alternativa-${index}`)
      const imageUrl = await uploadAlternativaImage(file, letra)
      
      const alternativas = [...form.getValues().alternativas]
      alternativas[index] = {
        ...alternativas[index],
        imagemUrl: imageUrl
      }
      form.setValue("alternativas", alternativas)
      setUploadingImage(null)
    } catch (err: any) {
      setError(`Erro ao fazer upload da imagem: ${err.message}`)
      setUploadingImage(null)
    }
  }

  // Função para clicar em um input de arquivo por ID
  const handleFileInputClick = (inputId: string) => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) input.click();
  };

  // Remover imagem do enunciado
  const removeEnunciadoImage = () => {
    form.setValue("imagemEnunciadoUrl", "")
  }

  // Remover imagem da alternativa
  const removeAlternativaImage = (index: number) => {
    const alternativas = [...form.getValues().alternativas]
    alternativas[index] = {
      ...alternativas[index],
      imagemUrl: ""
    }
    form.setValue("alternativas", alternativas)
  }

  // Lidar com o envio do formulário
  const handleFormSubmit = async (data: QuestaoFormValues) => {
    console.log("Formulário enviado:", data);
    
    // Criar uma cópia limpa dos dados para envio
    const cleanData = { ...data };
    
    // Remover URLs de imagem para criação
    // O backend já ignora esses campos, mas é melhor não enviá-los
    if (!isEdit) {
      // Para criação, remover as URLs - elas serão associadas posteriormente
      delete cleanData.imagemEnunciadoUrl;
      
      // Limpar as URLs das alternativas
      if (cleanData.alternativas) {
        cleanData.alternativas = cleanData.alternativas.map(alt => {
          const { imagemUrl, ...rest } = alt;
          return rest;
        });
      }
    }
    
    console.log("Dados limpos para envio:", JSON.stringify(cleanData, null, 2));
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Iniciando submissão...");
      await onSubmit(cleanData);
      console.log("Submissão concluída com sucesso");
      
      // Fechar dialog apenas após conclusão bem-sucedida
      handleDialogOpenChange(false);
      form.reset();
    } catch (err: any) {
      console.error("Erro na submissão:", err);
      
      // Se o erro tiver uma resposta detalhada
      if (err.response?.data) {
        console.error("Resposta da API:", err.response.data);
        
        // Exibir mensagem de erro mais específica baseada no código de erro
        const errorCode = err.response.data.code || '';
        const errorMessage = err.response.data.message || err.response.data.error || err.message;
        
        switch(errorCode) {
          case 'DUPLICATE_RESOURCE':
            setError(`Já existe uma questão com o número ${data.numero} nesta avaliação.`);
            break;
          case 'RELATED_RESOURCE_NOT_FOUND':
            setError(`A avaliação selecionada não foi encontrada.`);
            break;
          default:
            setError(`Erro de validação: ${errorMessage}`);
        }
      } else {
        setError(err.message || "Ocorreu um erro ao salvar a questão");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const API_BASE_URL = process.env.UPLOADS_BASE_URL || 'http://localhost:3001';

  // Função utilitária para construir URLs de imagem corretamente
  const buildImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Garantir que não há barras duplicadas
    const basePath = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const imagePath = path.startsWith('/') ? path : `/${path}`;
    
    return `${basePath}${imagePath}`;
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Edite os detalhes da questão abaixo." 
              : "Preencha os campos abaixo para criar uma nova questão."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form 
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              console.log("Form onSubmit acionado!");
              const values = form.getValues();
              handleFormSubmit(values);
            }} 
            className="space-y-6"
          >
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>Posição da questão na avaliação</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control as any}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0.1" 
                        step="0.1" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>Pontuação da questão</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="enunciado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enunciado</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4} 
                      className="resize-y min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Texto do enunciado da questão
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload de imagem para o enunciado */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="enunciado-imagem">Imagem do Enunciado (opcional)</Label>
                <input
                  ref={enunciadoImageInputRef}
                  type="file"
                  id="enunciado-imagem"
                  accept="image/*"
                  className="hidden"
                  onChange={handleEnunciadoImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => enunciadoImageInputRef.current?.click()}
                  disabled={!uploadEnunciadoImage || !!uploadingImage}
                >
                  {uploadingImage === "enunciado" ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Enviar Imagem
                    </>
                  )}
                </Button>
              </div>
              
              {(() => {
                const imagemUrl = form.watch("imagemEnunciadoUrl");
                return imagemUrl ? (
                  <div className="relative mt-2 rounded-md overflow-hidden border">
                    <img 
                      src={buildImageUrl(imagemUrl)} 
                      alt="Imagem do enunciado" 
                      className="max-h-48 object-contain mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeEnunciadoImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null;
              })()}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Alternativas</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAlternativa}
                  disabled={fields.length >= 5}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-start border rounded-md p-4">
                  <div className="flex-shrink-0 mt-1">
                    <RadioGroup value={form.getValues().alternativas[index].correta ? "true" : "false"}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="true" 
                          id={`correta-${index}`} 
                          checked={form.getValues().alternativas[index].correta}
                          onClick={() => handleCorrectChange(index)}
                        />
                        <Label htmlFor={`correta-${index}`} className="text-xs font-normal">
                          Correta
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-md">
                        {LETRAS_ALTERNATIVAS[index]}
                      </div>
                      
                      <FormField
                        control={form.control as any}
                        name={`alternativas.${index}.texto`}
                        render={({ field }) => (
                          <FormItem className="flex-grow">
                            <FormControl>
                              <Textarea 
                                placeholder="Texto da alternativa" 
                                className="min-h-[70px] resize-y"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Upload de imagem para a alternativa */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`alternativa-imagem-${index}`} className="text-xs">
                          Imagem da alternativa (opcional)
                        </Label>
                        <input
                          type="file"
                          id={`alternativa-imagem-${index}`}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleAlternativaImageUpload(index, e)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleFileInputClick(`alternativa-imagem-${index}`)}
                          disabled={!uploadAlternativaImage || !!uploadingImage}
                          className="h-8 text-xs"
                        >
                          {uploadingImage === `alternativa-${index}` ? (
                            <>
                              <div className="animate-spin mr-1 h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="mr-1 h-3 w-3" />
                              Imagem
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {(() => {
                        const imagemUrl = form.watch(`alternativas.${index}.imagemUrl`);
                        return imagemUrl ? (
                          <div className="relative mt-2 rounded-md overflow-hidden border">
                            <img 
                              src={buildImageUrl(imagemUrl)} 
                              alt={`Imagem alternativa ${LETRAS_ALTERNATIVAS[index]}`} 
                              className="max-h-32 object-contain mx-auto"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => removeAlternativaImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  {fields.length > 3 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeAlternativa(index)}
                      className="text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remover alternativa</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <FormField
              control={form.control as any}
              name="explicacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Explicação (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explique a resposta correta (opcional)" 
                      className="resize-y"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Uma explicação para ajudar a entender a resposta correta
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleDialogOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  console.log("Botão clicado");
                  // Acessar diretamente a função handleSubmit
                  if (formRef.current) {
                    console.log("Formulário encontrado, disparando submit");
                    formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  } else {
                    console.log("Formulário não encontrado!");
                    // Submit direto
                    const values = form.getValues();
                    handleFormSubmit(values);
                  }
                }}
              >
                {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}