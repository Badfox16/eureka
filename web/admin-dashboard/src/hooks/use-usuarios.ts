import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usuarioService } from "@/services/usuario.service";
import { Usuario, CreateUsuarioInput, UpdateUsuarioInput } from "@/types/usuario";
import { toast } from "sonner";

interface UseUsuariosOptions {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: string;
  status?: string;
}

export function useUsuarios(initialOptions: UseUsuariosOptions = {}) {
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useState<UseUsuariosOptions>(initialOptions);

  // Função para atualizar parâmetros de consulta
  const updateQueryParams = (newParams: Partial<UseUsuariosOptions>) => {
    setQueryParams(prev => ({ ...prev, ...newParams }));
  };

  // Função para resetar filtros
  const resetFilters = () => {
    setQueryParams({
      page: queryParams.page,
      limit: queryParams.limit
    });
  };

  // Consulta para obter usuários
  const { 
    data,
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['usuarios', queryParams],
    queryFn: () => usuarioService.getAll(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Extrair dados da resposta no novo formato
  const usuarios = data?.data || [];
  const pagination = data?.pagination || { 
    total: 0, 
    totalPages: 0, 
    currentPage: 1, 
    limit: 10 
  };

  // Mutação para criar usuário
  const createUsuarioMutation = useMutation({
    mutationFn: (data: CreateUsuarioInput) => usuarioService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    }
  });

  // Mutação para atualizar usuário
  const updateUsuarioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: UpdateUsuarioInput }) => 
      usuarioService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    }
  });

  // Mutação para excluir usuário
  const deleteUsuarioMutation = useMutation({
    mutationFn: (id: string) => usuarioService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    }
  });

  return {
    usuarios,
    isLoading,
    error,
    pagination,
    queryParams,
    updateQueryParams,
    resetFilters,
    createUsuario: createUsuarioMutation.mutateAsync,
    updateUsuario: updateUsuarioMutation.mutateAsync,
    deleteUsuario: deleteUsuarioMutation.mutateAsync
  };
}