"use client"

import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UsuarioForm } from "@/components/usuarios/usuario-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Usuario, CreateUsuarioInput, UpdateUsuarioInput } from "@/types/usuario";
import { TipoUsuario } from "@/types/base";
import { formatDate } from "@/lib/utils";
import { hasRole } from "@/lib/auth";
import { useUsuarios } from "@/hooks/use-usuarios";

export default function UsuariosPage() {
  // Estado local para o input de busca (para não fazer requisições a cada tecla)
  const [searchInput, setSearchInput] = useState("");
  
  // Usar o hook personalizado para gerenciar usuários
  const { 
    usuarios, 
    isLoading, 
    error, 
    pagination, 
    queryParams,
    updateQueryParams,
    resetFilters,
    createUsuario,
    updateUsuario,
    deleteUsuario
  } = useUsuarios();

  // Verificar se o usuário atual tem permissão para editar
  const canEdit = hasRole(TipoUsuario.ADMIN);

  // Aplicar filtro de busca
  const handleSearch = () => {
    updateQueryParams({ search: searchInput, page: 1 });
  };

  // Aplicar filtro de tipo
  const handleTipoFilter = (value: string) => {
    updateQueryParams({ 
      tipo: value === "all" ? undefined : value,
      page: 1 
    });
  };

  // Renderizar badge por tipo de usuário
  const renderTipoBadge = (tipo: TipoUsuario) => {
    switch (tipo) {
      case TipoUsuario.ADMIN:
        return <Badge variant="default">Administrador</Badge>;
      case TipoUsuario.PROFESSOR:
        return <Badge variant="outline">Professor</Badge>;
      case TipoUsuario.NORMAL:
        return <Badge variant="secondary">Aluno</Badge>;
      default:
        return <Badge>{tipo}</Badge>;
    }
  };

  // Lidar com a criação de usuário - com tipo explícito
  const handleCreateUsuario = async (data: {
    nome: string;
    email: string;
    password?: string;
    tipo: TipoUsuario;
  }): Promise<void> => {
    await createUsuario({
      nome: data.nome,
      email: data.email,
      password: data.password || '', // Garantir que password seja sempre string
      tipo: data.tipo
    });
  };

  // Lidar com a atualização de usuário - com tipo explícito
  const handleUpdateUsuario = async (usuario: Usuario, data: {
    nome?: string;
    email?: string;
    password?: string;
    tipo?: TipoUsuario;
  }): Promise<void> => {
    await updateUsuario({ 
      id: usuario._id, 
      data: {
        nome: data.nome,
        email: data.email,
        password: data.password,
        tipo: data.tipo
      } 
    });
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
      <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
      <div className="space-y-4">
        {/* Filtros e Ações */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8 w-full sm:w-[250px]"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 w-9 p-0"
                  onClick={() => {
                    setSearchInput("");
                    updateQueryParams({ search: undefined, page: 1 });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Select 
              value={queryParams.tipo || "all"} 
              onValueChange={handleTipoFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value={TipoUsuario.ADMIN}>Administrador</SelectItem>
                <SelectItem value={TipoUsuario.PROFESSOR}>Professor</SelectItem>
                <SelectItem value={TipoUsuario.NORMAL}>Aluno</SelectItem>
              </SelectContent>
            </Select>
            
            {(queryParams.search || queryParams.tipo || queryParams.status) && (
              <Button variant="outline" onClick={resetFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
          
          {canEdit && (
            <UsuarioForm
              title="Criar Novo Usuário"
              onSubmit={handleCreateUsuario}
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              }
            />
          )}
        </div>

        {/* Tabela de Usuários */}
        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Carregando usuários...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive text-center">
            {String(error)}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  {canEdit && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canEdit ? 5 : 4} className="text-center">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario: Usuario) => (
                    <TableRow key={usuario._id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{renderTipoBadge(usuario.tipo)}</TableCell>
                      <TableCell>{usuario.createdAt ? formatDate(usuario.createdAt) : '-'}</TableCell>
                      {canEdit && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <UsuarioForm
                              title="Editar Usuário"
                              usuario={usuario}
                              onSubmit={(data) => handleUpdateUsuario(usuario, data)}
                              trigger={
                                <Button variant="outline" size="default">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <ConfirmDialog
                              title="Excluir Usuário"
                              description={`Tem certeza que deseja excluir o usuário ${usuario.nome}? Esta ação não pode ser desfeita.`}
                              onConfirm={async () => {
                                await deleteUsuario(usuario._id);
                                return; // Retornar void para corresponder à tipagem
                              }}
                              trigger={
                                <Button variant="destructive" size="default">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                            />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Paginação */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {usuarios.length} de {pagination.total} usuários
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => updateQueryParams({ 
                page: Math.max((queryParams.page || 1) - 1, 1) 
              })}
              disabled={(queryParams.page || 1) <= 1 || isLoading}
            >
              Anterior
            </Button>
            <div className="text-sm text-muted-foreground">
              Página {queryParams.page || 1} de {pagination.totalPages || 1}
            </div>
            <Button
              variant="outline"
              onClick={() => updateQueryParams({ 
                page: Math.min((queryParams.page || 1) + 1, pagination.totalPages) 
              })}
              disabled={(queryParams.page || 1) >= pagination.totalPages || isLoading}
            >
              Próxima
            </Button>
            
            <Select 
              value={String(queryParams.limit || 10)} 
              onValueChange={(value) => {
                updateQueryParams({
                  limit: Number(value),
                  page: 1
                });
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={`${queryParams.limit || 10} por página`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por página</SelectItem>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="15">15 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}