import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface ModalFormProps<T extends z.ZodType> {
  title: string;
  description?: string;
  schema: T;
  defaultValues?: any;
  onSubmit: (data: z.infer<T>) => Promise<void> | void;
  children: (onClose: () => void) => React.ReactNode;
  trigger: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  openChange?: (open: boolean) => void;
  isSubmitting?: boolean;
}

export function ModalForm<T extends z.ZodType>({
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  children,
  trigger,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  openChange,
  isSubmitting
}: ModalFormProps<T>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function handleSubmit(data: z.infer<T>) {
    try {
      setLoading(true);
      await onSubmit(data);
      methods.reset();
      setOpen(false);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    setOpen(open);
    if (open === false) {
      methods.reset();
    }
    if (openChange) {
      openChange(open);
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4">
            {children(handleClose)}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
              >
                {cancelLabel}
              </Button>
              <Button 
                type="submit" 
                disabled={loading || isSubmitting}
              >
                {loading ? 'Processando...' : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}