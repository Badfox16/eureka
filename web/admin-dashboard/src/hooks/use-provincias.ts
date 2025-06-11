import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { provinciaService } from '@/services/provincia.service';
import { 
  CreateProvinciaInput, 
  UpdateProvinciaInput 
} from '@/types/provincia';
import { QueryParams } from '@/types/api';
import { toast } from 'sonner';

// Query key para provincias
const PROVINCIAS_KEY = 'provincias';

// Hook para buscar todas as provincias
export function useProvincias(params?: QueryParams) {
  return useQuery({
    queryKey: [PROVINCIAS_KEY, params],
    queryFn: () => provinciaService.getAll(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para buscar uma provincia por ID
export function useProvincia(id: string) {
  return useQuery({
    queryKey: [PROVINCIAS_KEY, id],
    queryFn: () => provinciaService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para criar provincia
export function useCreateProvincia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProvinciaInput) => provinciaService.create(data),
    onSuccess: () => {
      toast.success('Província criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: [PROVINCIAS_KEY] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar província: ${error.message}`);
    }
  });
}

// Hook para atualizar provincia
export function useUpdateProvincia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateProvinciaInput) => 
      provinciaService.update(id, data),
    onSuccess: () => {
      toast.success('Província atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: [PROVINCIAS_KEY] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar província: ${error.message}`);
    }
  });
}

// Hook para excluir provincia
export function useDeleteProvincia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => provinciaService.delete(id),
    onSuccess: () => {
      toast.success('Província excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: [PROVINCIAS_KEY] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir província: ${error.message}`);
    }
  });
}