import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { TipoUsuario } from '@/types';
import { toast } from 'sonner';
import { 
  createUsuarioSchema, 
  updateUsuarioSchema 
} from '@/schemas/usuario.schema';
import type { z } from 'zod';
import { Usuario } from '@/types/usuario';

type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;

interface UsuarioFormProps {
  usuario?: Usuario;
  onSubmit: (data: CreateUsuarioInput | UpdateUsuarioInput) => Promise<void>;
  trigger: React.ReactNode;
  title: string;
}

export function UsuarioForm({ 
  usuario, 
  onSubmit, 
  trigger, 
  title
}: UsuarioFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Determinar se é um formulário de edição ou criação
  const isEdit = !!usuario;
  
  // Escolher o schema apropriado
  const schema = isEdit ? updateUsuarioSchema : createUsuarioSchema;
  
  const form = useForm<CreateUsuarioInput | UpdateUsuarioInput>({
    resolver: zodResolver(schema),
    defaultValues: usuario 
      ? {
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo
        } 
      : {
          nome: '',
          email: '',
          password: '',
          tipo: TipoUsuario.NORMAL
        },
  });

  async function handleSubmit(data: CreateUsuarioInput | UpdateUsuarioInput) {
    try {
      setLoading(true);
      await onSubmit(data);
      form.reset();
      setOpen(false);
      toast.success(isEdit ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
    } catch (error) {
      // Não precisamos tratar o erro aqui, pois o handleApiError já faz isso
      console.error('Erro ao processar formulário:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preencha os dados do usuário nos campos abaixo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!isEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Mínimo 6 caracteres" 
                        type="password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Usuário</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de usuário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TipoUsuario.ADMIN}>Administrador</SelectItem>
                      <SelectItem value={TipoUsuario.PROFESSOR}>Professor</SelectItem>
                      <SelectItem value={TipoUsuario.NORMAL}>Aluno</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Processando...' : isEdit ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}