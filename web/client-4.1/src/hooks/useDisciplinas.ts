import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getDisciplinas, 
  getDisciplinaById, 
  searchDisciplinas, 
  createDisciplina, 
  updateDisciplina, 
  deleteDisciplina,
  createDisciplinasEmMassa
} from '@/api/disciplina';
import type { 
  Disciplina, 
  CreateDisciplinaInput, 
  UpdateDisciplinaInput, 
  DisciplinaSearchParams 
} from '@/types/disciplina';

// Hook para listar disciplinas com paginação e filtragem
export const useDisciplinas = (params?: DisciplinaSearchParams) => {
  return useQuery({
    queryKey: ['disciplinas', params],
    queryFn: () => getDisciplinas(params),
    select: (response) => ({
      disciplinas: response.data,
      pagination: response.pagination
    })
  });
};

// Hook para obter uma disciplina por ID
export const useDisciplina = (id?: string) => {
  return useQuery({
    queryKey: ['disciplina', id],
    queryFn: () => getDisciplinaById(id as string),
    enabled: !!id,
    select: (response) => response.data
  });
};

// Hook para pesquisar disciplinas por termo
export const useSearchDisciplinas = (query: string) => {
  return useQuery({
    queryKey: ['disciplinas', 'search', query],
    queryFn: () => searchDisciplinas(query),
    enabled: query.length > 2,
    select: (response) => response.data
  });
};

// Hook para criar uma nova disciplina
export const useCreateDisciplina = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDisciplinaInput) => createDisciplina(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplinas'] });
    }
  });
};

// Hook para criar múltiplas disciplinas em massa
export const useCreateDisciplinasEmMassa = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateDisciplinaInput[]) => createDisciplinasEmMassa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplinas'] });
    }
  });
};

// Hook para atualizar uma disciplina
export const useUpdateDisciplina = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDisciplinaInput }) => 
      updateDisciplina(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['disciplinas'] });
      queryClient.invalidateQueries({ queryKey: ['disciplina', variables.id] });
    }
  });
};

// Hook para remover uma disciplina
export const useDeleteDisciplina = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteDisciplina(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disciplinas'] });
    }
  });
};

// Hook combinado para todas as operações com disciplinas
export function useDisciplinaOperations() {
  return {
    useDisciplinas,
    useDisciplina,
    useSearchDisciplinas,
    useCreateDisciplina,
    useCreateDisciplinasEmMassa,
    useUpdateDisciplina,
    useDeleteDisciplina
  };
}
