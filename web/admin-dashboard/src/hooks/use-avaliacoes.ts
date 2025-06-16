import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { avaliacaoService } from '@/services/avaliacao.service';
import { 
  Avaliacao, 
  CreateAvaliacaoInput, // Adicionar importação
  UpdateAvaliacaoInput  // Adicionar importação
} from '@/types/avaliacao';
import { ApiResponse, QueryParams } from '@/types/api'; // Modificar para usar QueryParams da API
import { toast } from 'sonner';

/**
 * Hook para listar avaliações com filtros e paginação
 */
export function useAvaliacoes(params?: QueryParams) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['avaliacoes', params],
    queryFn: () => avaliacaoService.getAll(params),
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  const apiResponse = data as ApiResponse<Avaliacao[]>;

  return {
    data, // Retornar o objeto de resposta completo
    avaliacoes: apiResponse?.data || [],
    pagination: apiResponse?.pagination,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook para obter uma avaliação específica
 */
export function useAvaliacao(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['avaliacao', id],
    queryFn: () => avaliacaoService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  // Extrair o objeto avaliação corretamente da resposta
  return {
    avaliacao: (data as ApiResponse<Avaliacao>)?.data,
    isLoading,
    error
  };
}

/**
 * Hook para buscar avaliações por termo
 */
export function useSearchAvaliacoes(query: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['avaliacoes', 'search', query],
    queryFn: () => avaliacaoService.search(query),
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 // 1 minuto
  });

  return {
    avaliacoes: data || [],
    isLoading,
    error
  };
}

/**
 * Hook para criar avaliação
 */
export function useCreateAvaliacao() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data: CreateAvaliacaoInput) => avaliacaoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
      toast.success("Avaliação criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar avaliação: ${error.message || "Ocorreu um erro"}`);
    }
  });
  
  return mutation;
}

/**
 * Hook para atualizar avaliação
 */
export function useUpdateAvaliacao() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateAvaliacaoInput }) => 
      avaliacaoService.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
      queryClient.invalidateQueries({ queryKey: ['avaliacao', variables.id] });
      toast.success("Avaliação atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar avaliação: ${error.message || "Ocorreu um erro"}`);
    }
  });
  
  return mutation;
}

/**
 * Hook para excluir avaliação
 */
export function useDeleteAvaliacao() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (id: string) => avaliacaoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes'] });
      toast.success("Avaliação excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir avaliação: ${error.message || "Ocorreu um erro"}`);
    }
  });
  
  return mutation;
}