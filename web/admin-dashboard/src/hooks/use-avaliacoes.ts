import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { avaliacaoService } from '@/services/avaliacao.service';
import { 
  Avaliacao, 
  CreateAvaliacaoInput, 
  UpdateAvaliacaoInput
} from '@/types/avaliacao';
import { toast } from 'sonner';

// Interface para parâmetros de consulta
interface QueryParams {
  page?: number;
  limit?: number;
  tipo?: string;
  disciplina?: string;
  ano?: number;
  classe?: number;
  trimestre?: string;
  provincia?: string;
  epoca?: string;
  variante?: string;
  areaEstudo?: string;
  search?: string;
}

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

  return {
    data,
    isLoading,
    error,
    refetch,
    avaliacoes: data?.data || [],
    pagination: data?.pagination
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

  return {
    avaliacao: data,
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