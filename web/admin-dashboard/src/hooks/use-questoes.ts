import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questaoService } from '@/services/questao.service';
import { 
  Questao, 
  CreateQuestaoInput, 
  UpdateQuestaoInput,
  QuestaoQueryParams
} from '@/types/questao';
import { ApiResponse } from '@/types/api';
import { toast } from 'sonner';

/**
 * Hook para listar questões com filtros e paginação
 */
export function useQuestoes(params?: QuestaoQueryParams) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['questoes', params],
    queryFn: () => questaoService.getAll(params),
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  return {
    data,
    isLoading,
    error,
    refetch,
    questoes: data?.data || [],
    pagination: data?.pagination
  };
}

/**
 * Hook para obter uma questão específica
 */
export function useQuestao(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['questao', id],
    queryFn: () => questaoService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  return {
    questao: data?.data,
    isLoading,
    error
  };
}

/**
 * Hook para adicionar uma questão a uma avaliação
 */
export function useAddQuestaoToAvaliacao() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: ({ avaliacaoId, questaoId }: { avaliacaoId: string, questaoId: string }) => 
      questaoService.addToAvaliacao(avaliacaoId, questaoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questoes', { avaliacaoId: variables.avaliacaoId }] });
      queryClient.invalidateQueries({ queryKey: ['questoes', { notInAvaliacao: variables.avaliacaoId }] });
      queryClient.invalidateQueries({ queryKey: ['avaliacao', variables.avaliacaoId] });
      toast.success("Questão adicionada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar questão: ${error.message || "Ocorreu um erro"}`);
    }
  });
  
  return mutation;
}

/**
 * Hook para remover uma questão de uma avaliação
 */
export function useRemoveQuestaoFromAvaliacao() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: ({ avaliacaoId, questaoId }: { avaliacaoId: string, questaoId: string }) => 
      questaoService.removeFromAvaliacao(avaliacaoId, questaoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questoes', { avaliacaoId: variables.avaliacaoId }] });
      queryClient.invalidateQueries({ queryKey: ['questoes', { notInAvaliacao: variables.avaliacaoId }] });
      queryClient.invalidateQueries({ queryKey: ['avaliacao', variables.avaliacaoId] });
      toast.success("Questão removida com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover questão: ${error.message || "Ocorreu um erro"}`);
    }
  });
  
  return mutation;
}

/**
 * Hook para criar questão
 */
export function useCreateQuestao() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data: CreateQuestaoInput) => questaoService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['questoes'] });
      return response.data; // Retorna a questão criada para uso posterior
    },
    onError: (error: any) => {
      console.error("Erro na criação de questão:", error);
    }
  });
  
  return mutation;
}

/**
 * Hook para atualizar questão
 */
export function useUpdateQuestao() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateQuestaoInput }) => 
      questaoService.update(id, data),
    onSuccess: (response, variables) => {
      // Invalidar cache da questão específica
      queryClient.invalidateQueries({ queryKey: ['questao', variables.id] });
      
      // Invalidar cache da lista de questões
      queryClient.invalidateQueries({ queryKey: ['questoes'] });
    },
    onError: (error: any) => {
      console.error("Erro na atualização de questão:", error);
    }
  });
  
  return mutation;
}

/**
 * Hook para excluir questão
 */
export function useDeleteQuestao() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (id: string) => questaoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questoes'] });
      toast.success("Questão excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir questão: ${error.message || "Ocorreu um erro"}`);
    }
  });
  
  return mutation;
}

/**
 * Hook para upload de imagem do enunciado
 */
export function useUploadImagemEnunciado() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: ({ id, file }: { id: string, file: File }) => 
      questaoService.uploadImagemEnunciado(id, file),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questao', variables.id] });
      toast.success("Imagem do enunciado carregada com sucesso!");
      return response.data.imageUrl;
    },
    onError: (error: any) => {
      toast.error(`Erro ao carregar imagem: ${error.message || "Ocorreu um erro"}`);
    }
  });
  
  return mutation;
}

/**
 * Hook para upload de imagem de alternativa
 */
export function useUploadImagemAlternativa() {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: ({ id, letra, file }: { id: string, letra: string, file: File }) => 
      questaoService.uploadImagemAlternativa(id, letra, file),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questao', variables.id] });
      toast.success(`Imagem da alternativa ${variables.letra} carregada com sucesso!`);
      return response.data.imageUrl;
    },
    onError: (error: any) => {
      toast.error(`Erro ao carregar imagem: ${error.message || "Ocorreu um erro"}`);
    }
  });
  
  return mutation;
}