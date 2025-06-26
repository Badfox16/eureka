import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questaoService } from '@/services/questao.service';
import { 
  Questao, 
  CreateQuestaoInput, 
  UpdateQuestaoInput,
  QuestaoQueryParams
} from '@/types/questao';
import { ApiResponse } from '@/types/api';
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/error-utils';

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
  
  return useMutation({
    mutationFn: ({ avaliacaoId, questaoId }: { avaliacaoId: string, questaoId: string }) => 
      questaoService.addToAvaliacao(avaliacaoId, questaoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questoes', { avaliacaoId: variables.avaliacaoId }] });
      queryClient.invalidateQueries({ queryKey: ['questoes', { notInAvaliacao: variables.avaliacaoId }] });
      queryClient.invalidateQueries({ queryKey: ['avaliacao', variables.avaliacaoId] });
      showSuccessToast("Questão adicionada com sucesso!");
    },
    onError: (error: unknown) => {
      handleApiError(error, 'Adicionar Questão à Avaliação');
    }
  });
}

/**
 * Hook para remover uma questão de uma avaliação
 */
export function useRemoveQuestaoFromAvaliacao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ avaliacaoId, questaoId }: { avaliacaoId: string, questaoId: string }) => 
      questaoService.removeFromAvaliacao(avaliacaoId, questaoId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questoes', { avaliacaoId: variables.avaliacaoId }] });
      queryClient.invalidateQueries({ queryKey: ['questoes', { notInAvaliacao: variables.avaliacaoId }] });
      queryClient.invalidateQueries({ queryKey: ['avaliacao', variables.avaliacaoId] });
      showSuccessToast("Questão removida com sucesso!");
    },
    onError: (error: unknown) => {
      handleApiError(error, 'Remover Questão da Avaliação');
    }
  });
}

/**
 * Hook para criar questão
 * O toast de erro é tratado na página devido à complexidade do upload de imagens.
 */
export function useCreateQuestao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateQuestaoInput) => questaoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questoes'] });
    },
  });
}

/**
 * Hook para atualizar questão
 * O toast de erro é tratado na página devido à complexidade do upload de imagens.
 */
export function useUpdateQuestao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateQuestaoInput }) => 
      questaoService.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questoes'] });
      queryClient.invalidateQueries({ queryKey: ['questao', variables.id] });
    },
  });
}

/**
 * Hook para excluir questão
 */
export function useDeleteQuestao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => questaoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questoes'] });
      showSuccessToast("Questão excluída com sucesso!");
    },
    onError: (error: unknown) => {
      handleApiError(error, 'Excluir Questão');
    }
  });
}

/**
 * Hook para upload de imagem do enunciado
 */
export function useUploadImagemEnunciado() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, file }: { id: string, file: File }) => 
      questaoService.uploadImagemEnunciado(id, file),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questao', variables.id] });
      showSuccessToast("Imagem do enunciado carregada com sucesso!");
    },
    onError: (error: unknown) => {
      handleApiError(error, 'Upload Imagem Enunciado');
    }
  });
}

/**
 * Hook para upload de imagem de alternativa
 */
export function useUploadImagemAlternativa() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, letra, file }: { id: string, letra: string, file: File }) => 
      questaoService.uploadImagemAlternativa(id, letra, file),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questao', variables.id] });
      showSuccessToast(`Imagem da alternativa ${variables.letra} carregada com sucesso!`);
    },
    onError: (error: unknown) => {
      handleApiError(error, 'Upload Imagem Alternativa');
    }
  });
}

/**
 * Hook para associar uma imagem temporária ao enunciado
 */
export function useAssociarImagemTemporaria() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      questaoId, 
      imagemTemporariaUrl, 
      tipo, 
      letra 
    }: { 
      questaoId: string, 
      imagemTemporariaUrl: string, 
      tipo: 'enunciado' | 'alternativa', 
      letra?: string 
    }) => {
      return questaoService.associarImagemTemporaria(
        questaoId, 
        imagemTemporariaUrl, 
        tipo, 
        letra
      );
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questao', variables.questaoId] });
      queryClient.invalidateQueries({ queryKey: ['questoes'] });
      
      const tipoMsg = variables.tipo === 'enunciado' 
        ? 'do enunciado' 
        : `da alternativa ${variables.letra}`;
      
      showSuccessToast(`Imagem ${tipoMsg} associada com sucesso!`);
    },
    onError: (error: unknown) => {
      handleApiError(error, 'Associar Imagem Temporária');
    }
  });
}