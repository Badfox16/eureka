import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disciplinaService } from '@/services/disciplina.service';
import { 
  Disciplina,
  CreateDisciplinaInput, // Adicionar importação
  UpdateDisciplinaInput  // Adicionar importação
} from '@/types/disciplina';
import { ApiResponse, QueryParams } from '@/types/api'; // Adicionar QueryParams
import { handleApiError, showSuccessToast } from '@/lib/error-utils';

// Query key para disciplinas
const DISCIPLINAS_KEY = 'disciplinas';

// Hook para buscar todas as disciplinas
export function useDisciplinas(params?: QueryParams) {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['disciplinas', params],
    queryFn: () => disciplinaService.getAll(params),
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  return {
    data, // Retornar o objeto de resposta completo para usar com ApiResponse<Disciplina[]>
    isLoading,
    error,
    refetch
  };
}

// Hook para buscar uma disciplina por ID
export function useDisciplina(id: string) {
  return useQuery({
    queryKey: [DISCIPLINAS_KEY, id],
    queryFn: () => disciplinaService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para buscar disciplinas por termo de busca
export function useSearchDisciplinas(query: string) {
  return useQuery({
    queryKey: [DISCIPLINAS_KEY, 'search', query],
    queryFn: () => disciplinaService.search(query),
    enabled: query.length >= 1,
    staleTime: 1000 * 60, // 1 minuto
  });
}

// Hook para criar disciplina
export function useCreateDisciplina() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDisciplinaInput) => disciplinaService.create(data),
    onSuccess: () => {
      showSuccessToast('Disciplina criada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['disciplinas'] });
    },
    onError: (error) => {
      handleApiError(error, 'Criar Disciplina');
    }
  });
}

// Hook para atualizar disciplina
export function useUpdateDisciplina() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateDisciplinaInput }) => 
      disciplinaService.update(id, data),
    onSuccess: (response, { id }) => {
      showSuccessToast('Disciplina atualizada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['disciplinas'] });
      queryClient.invalidateQueries({ queryKey: ['disciplina', id] });
    },
    onError: (error) => {
      handleApiError(error, 'Atualizar Disciplina');
    }
  });
}

// Hook para excluir disciplina
export function useDeleteDisciplina() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => disciplinaService.delete(id),
    onSuccess: () => {
      showSuccessToast('Disciplina excluída com sucesso');
      queryClient.invalidateQueries({ queryKey: ['disciplinas'] });
    },
    onError: (error) => {
      handleApiError(error, 'Excluir Disciplina');
    }
  });
}