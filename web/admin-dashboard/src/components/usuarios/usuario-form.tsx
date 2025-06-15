import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TipoUsuario } from '@/types/base';
import { Usuario, CreateUsuarioInput, UpdateUsuarioInput } from '@/types/usuario';

// Definir explicitamente o tipo para os dados do formulário
type FormData = {
  nome: string;
  email: string;
  password?: string;
  tipo: TipoUsuario;
};

interface UsuarioFormProps {
  title: string;
  usuario?: Usuario;
  onSubmit: (data: FormData) => Promise<void>;
  trigger: React.ReactNode;
}

export function UsuarioForm({ title, usuario, onSubmit, trigger }: UsuarioFormProps) {
  const [open, setOpen] = useState(false);
  const isEditMode = !!usuario;

  // Schema com password opcional para edição
  const formSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: isEditMode 
      ? z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional()
      : z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    tipo: z.nativeEnum(TipoUsuario, {
      errorMap: () => ({ message: 'Tipo de usuário inválido' }),
    }),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode
      ? {
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
        }
      : {
          nome: '',
          email: '',
          password: '',
          tipo: TipoUsuario.NORMAL,
        },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
      setOpen(false);
      form.reset();
    } catch (error) {
      // O erro já será tratado pelo hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
            
            {!isEditMode && (
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
            
            <Button 
              type="submit" 
              className="w-full"
            >
              {isEditMode ? 'Atualizar Usuário' : 'Criar Usuário'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}