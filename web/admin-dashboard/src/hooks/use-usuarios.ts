import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuarioService } from '@/services/usuario.service';
import { Usuario, CreateUsuarioInput, UpdateUsuarioInput } from '@/types/usuario';
import { TipoUsuario } from '@/types';

interface UseUsuariosOptions {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: string;
}

export function useUsuarios(options: UseUsuariosOptions = {}) {
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useState({
    page: options.page || 1,
    limit: options.limit || 10,
    search: options.search || '',
    tipo: options.tipo || ''
  });

  // Atualizar queryParams quando as opções mudarem
  useEffect(() => {
    setQueryParams(prev => ({
      ...prev,
      page: options.page || prev.page,
      limit: options.limit || prev.limit,
      search: options.search || prev.search,
      tipo: options.tipo || prev.tipo
    }));
  }, [options.page, options.limit, options.search, options.tipo]);

  // Consulta de usuários - usando getAll em vez de getUsuarios
  const { data, isLoading, error } = useQuery({
    queryKey: ['usuarios', queryParams],
    queryFn: () => usuarioService.getAll(queryParams)
  });

  // Mutações - ajustando para usar os métodos corretos do serviço
  const createMutation = useMutation({
    mutationFn: (data: CreateUsuarioInput) => usuarioService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateUsuarioInput }) => 
      usuarioService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usuarioService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    }
  });

  // Função para atualizar os parâmetros de consulta
  const updateQueryParams = (newParams: Partial<typeof queryParams>) => {
    setQueryParams(prev => ({ ...prev, ...newParams }));
  };

  // Função para resetar filtros
  const resetFilters = () => {
    setQueryParams({
      page: 1,
      limit: queryParams.limit,
      search: '',
      tipo: ''
    });
  };

  return {
    usuarios: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    queryParams,
    updateQueryParams,
    resetFilters,
    createUsuario: createMutation.mutateAsync,
    updateUsuario: updateMutation.mutateAsync,
    deleteUsuario: deleteMutation.mutateAsync
  };
}