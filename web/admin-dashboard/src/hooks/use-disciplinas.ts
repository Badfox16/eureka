import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { disciplinaService } from '@/services/disciplina.service';
import { 
  Disciplina,
  CreateDisciplinaInput, 
  UpdateDisciplinaInput 
} from '@/types/disciplina';
import { QueryParams, PaginatedResponse } from '@/types/api';
import { toast } from 'sonner';

// Query key para disciplinas
const DISCIPLINAS_KEY = 'disciplinas';

// Hook para buscar todas as disciplinas
export function useDisciplinas(params?: QueryParams) {
  const hasSearchTerm = params?.search && params.search.length >= 2;
  
  return useQuery<PaginatedResponse<Disciplina>>({
    queryKey: [DISCIPLINAS_KEY, params],
    queryFn: async () => {
      try {
        // Se há um termo de pesquisa válido, use o endpoint de search
        if (hasSearchTerm && params?.search) {
          return disciplinaService.search(params.search);
        }
        
        // Não há termo de pesquisa, usar endpoint normal
        const { search, ...restParams } = params || {};
        return disciplinaService.getAll(restParams);
      } catch (error) {
        console.error("Erro ao buscar disciplinas:", error);
        // Retorne uma estrutura vazia mas consistente em caso de erro
        return {
          data: [],
          pagination: {
            total: 0,
            totalPages: 0,
            currentPage: 1,
            limit: params?.limit || 10,
            hasPrevPage: false,
            hasNextPage: false,
            prevPage: null,
            nextPage: null
          }
        };
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
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
      toast.success('Disciplina criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: [DISCIPLINAS_KEY] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar disciplina: ${error.message}`);
    }
  });
}

// Hook para atualizar disciplina
export function useUpdateDisciplina() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & UpdateDisciplinaInput) => 
      disciplinaService.update(id, data),
    onSuccess: () => {
      toast.success('Disciplina atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: [DISCIPLINAS_KEY] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar disciplina: ${error.message}`);
    }
  });
}

// Hook para excluir disciplina
export function useDeleteDisciplina() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => disciplinaService.delete(id),
    onSuccess: () => {
      toast.success('Disciplina excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: [DISCIPLINAS_KEY] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir disciplina: ${error.message}`);
    }
  });
}