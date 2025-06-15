import { useState } from 'react';
import { usuarioService } from '@/services/usuario.service';
import { Usuario, CreateUsuarioInput, UpdateUsuarioInput } from '@/types/usuario';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UsuarioQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: string;
  status?: string;
}

// Formato de resposta padronizado para o frontend
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

export function useUsuarios() {
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useState<UsuarioQueryParams>({
    page: 1,
    limit: 10
  });

  // Função para atualizar os parâmetros de consulta
  const updateQueryParams = (newParams: Partial<UsuarioQueryParams>) => {
    setQueryParams(prev => ({ ...prev, ...newParams }));
  };

  // Obter lista de usuários
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['usuarios', queryParams],
    queryFn: () => usuarioService.getAll(queryParams),
  });

  // Criar usuário
  const createUsuarioMutation = useMutation({
    mutationFn: (userData: CreateUsuarioInput) => 
      usuarioService.create(userData),
    onSuccess: () => {
      toast.success('Usuário criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar usuário: ${error.message || 'Tente novamente mais tarde'}`);
    }
  });

  // Atualizar usuário
  const updateUsuarioMutation = useMutation({
    mutationFn: ({ id, data }: { 
      id: string, 
      data: UpdateUsuarioInput
    }) => usuarioService.update(id, data),
    onSuccess: () => {
      toast.success('Usuário atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar usuário: ${error.message || 'Tente novamente mais tarde'}`);
    }
  });

  // Excluir usuário
  const deleteUsuarioMutation = useMutation({
    mutationFn: (id: string) => usuarioService.delete(id),
    onSuccess: () => {
      toast.success('Usuário excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao excluir usuário: ${error.message || 'Tente novamente mais tarde'}`);
    }
  });

  // Buscar usuário por ID
  const getUsuario = async (id: string): Promise<Usuario> => {
    try {
      return await usuarioService.getById(id);
    } catch (error: any) {
      toast.error(`Erro ao buscar detalhes do usuário: ${error.message || 'Tente novamente mais tarde'}`);
      throw error;
    }
  };

  // Função para limpar filtros
  const resetFilters = () => {
    setQueryParams({
      page: 1,
      limit: queryParams.limit || 10
    });
  };

  // Dados default para quando data for undefined
  const defaultData: PaginatedResponse<Usuario> = {
    data: [],
    pagination: {
      total: 0,
      page: queryParams.page || 1,
      limit: queryParams.limit || 10,
      totalPages: 1
    }
  };

  return {
    // Dados e estado
    usuarios: data?.data || [],
    isLoading,
    error,
    pagination: data?.pagination || defaultData.pagination,
    queryParams,
    
    // Ações
    updateQueryParams,
    resetFilters,
    refetch,
    
    // Mutações
    createUsuario: createUsuarioMutation.mutateAsync,
    updateUsuario: updateUsuarioMutation.mutateAsync,
    deleteUsuario: deleteUsuarioMutation.mutateAsync,
    getUsuario,
    
    // Estados das mutações
    isCreating: createUsuarioMutation.isPending,
    isUpdating: updateUsuarioMutation.isPending,
    isDeleting: deleteUsuarioMutation.isPending
  };
}