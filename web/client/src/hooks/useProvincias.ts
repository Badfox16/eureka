import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getProvincias, 
  getProvinciaById, 
  searchProvincias, 
  createProvincia, 
  updateProvincia, 
  deleteProvincia,
  createProvinciasEmMassa
} from '@/api/provincia';
import type { 
  Provincia, 
  CreateProvinciaInput, 
  UpdateProvinciaInput, 
  ProvinciaSearchParams 
} from '@/types/provincia';

// Hook para listar províncias com paginação e filtragem
export const useProvincias = (params?: ProvinciaSearchParams) => {
  return useQuery({
    queryKey: ['provincias', params],
    queryFn: () => getProvincias(params),
    select: (response) => ({
      provincias: response.data,
      pagination: response.pagination
    })
  });
};

// Hook para obter uma província por ID
export const useProvincia = (id?: string) => {
  return useQuery({
    queryKey: ['provincia', id],
    queryFn: () => getProvinciaById(id as string),
    enabled: !!id,
    select: (response) => response.data
  });
};

// Hook para pesquisar províncias por termo
export const useSearchProvincias = (query: string) => {
  return useQuery({
    queryKey: ['provincias', 'search', query],
    queryFn: () => searchProvincias(query),
    enabled: query.length > 2,
    select: (response) => response.data
  });
};

// Hook para criar uma nova província
export const useCreateProvincia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProvinciaInput) => createProvincia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provincias'] });
    }
  });
};

// Hook para criar múltiplas províncias em massa
export const useCreateProvinciasEmMassa = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProvinciaInput[]) => createProvinciasEmMassa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provincias'] });
    }
  });
};

// Hook para atualizar uma província
export const useUpdateProvincia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProvinciaInput }) => 
      updateProvincia(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['provincias'] });
      queryClient.invalidateQueries({ queryKey: ['provincia', variables.id] });
    }
  });
};

// Hook para remover uma província
export const useDeleteProvincia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteProvincia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provincias'] });
    }
  });
};

// Hook combinado para todas as operações com províncias
export function useProvinciaOperations() {
  return {
    useProvincias,
    useProvincia,
    useSearchProvincias,
    useCreateProvincia,
    useCreateProvinciasEmMassa,
    useUpdateProvincia,
    useDeleteProvincia
  };
}
