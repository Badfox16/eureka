import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { provinciaService } from '@/services/provincia.service';
import { 
  Provincia,
  CreateProvinciaInput, 
  UpdateProvinciaInput 
} from '@/types/provincia';
import { ApiResponse, QueryParams } from '@/types/api'; // Corrija a importação
import { handleApiError, showSuccessToast } from '@/lib/error-utils';

// Query key para provincias
const PROVINCIAS_KEY = 'provincias';

// Hook para buscar todas as provincias
export function useProvincias(params?: QueryParams) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['provincias', params],
    queryFn: () => provinciaService.getAll(params),
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  return {
    data, // Retornar o objeto de resposta completo para usar com ApiResponse<Provincia[]>
    isLoading,
    error,
    refetch
  };
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

// Hook para criar província
export function useCreateProvincia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProvinciaInput) => provinciaService.create(data),
    onSuccess: () => {
      showSuccessToast('Província criada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['provincias'] });
    },
    onError: (error) => {
      handleApiError(error, 'Criar Província');
    }
  });
}

// Hook para atualizar província
export function useUpdateProvincia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateProvinciaInput }) => 
      provinciaService.update(id, data),
    onSuccess: (response, { id }) => {
      showSuccessToast('Província atualizada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['provincias'] });
      queryClient.invalidateQueries({ queryKey: ['provincia', id] });
    },
    onError: (error) => {
      handleApiError(error, 'Atualizar Província');
    }
  });
}

// Hook para excluir província
export function useDeleteProvincia() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => provinciaService.delete(id),
    onSuccess: () => {
      showSuccessToast('Província excluída com sucesso');
      queryClient.invalidateQueries({ queryKey: ['provincias'] });
    },
    onError: (error) => {
      handleApiError(error, 'Excluir Província');
    }
  });
}