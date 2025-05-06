"use client"

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search, X, Filter } from "lucide-react";
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
import { TipoUsuario } from "@/types";
import { toast } from "sonner";
import { usuarioService } from "@/services/usuario.service";
import { Usuario } from "@/types/usuario";
import { formatDate } from "@/lib/utils";
import { hasRole } from "@/lib/auth";

export default function UsuariosPage() {
  // Estado para armazenar usuários
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para paginação e filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Verificar se o usuário atual tem permissão para editar
  const canEdit = hasRole(TipoUsuario.ADMIN);

  // Carregar usuários da API
  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await usuarioService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        tipo: tipoFilter || undefined,
        status: statusFilter || undefined
      });
      
      setUsuarios(response.data);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setError("Não foi possível carregar os usuários. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, [currentPage, itemsPerPage]);

  // Aplicar filtros (busca, tipo)
  const handleApplyFilters = () => {
    setCurrentPage(1); // Resetar para a primeira página ao filtrar
    loadUsuarios();
  };

  // Resetar filtros
  const resetFilters = () => {
    setSearchQuery("");
    setTipoFilter("");
    setStatusFilter("");
    setCurrentPage(1);
    loadUsuarios();
  };

  // Funções CRUD
  const handleCreateUsuario = async (data: any) => {
    await usuarioService.create(data);
    loadUsuarios();
  };

  const handleUpdateUsuario = async (id: string, data: any) => {
    await usuarioService.update(id, data);
    loadUsuarios();
  };

  const handleDeleteUsuario = async (id: string) => {
    await usuarioService.delete(id);
    loadUsuarios();
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full sm:w-[250px]"
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 w-9 p-0"
                  onClick={() => {
                    setSearchQuery("");
                    handleApplyFilters();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Select value={tipoFilter} onValueChange={(value) => {
              setTipoFilter(value);
              handleApplyFilters();
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value={TipoUsuario.ADMIN}>Administrador</SelectItem>
                <SelectItem value={TipoUsuario.PROFESSOR}>Professor</SelectItem>
                <SelectItem value={TipoUsuario.NORMAL}>Aluno</SelectItem>
              </SelectContent>
            </Select>
            
            {(searchQuery || tipoFilter || statusFilter) && (
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
            {error}
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
                  usuarios.map((usuario) => (
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
                              onSubmit={(data) => handleUpdateUsuario(usuario._id, data)}
                              trigger={
                                <Button variant="outline" size="default">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <ConfirmDialog
                              title="Excluir Usuário"
                              description={`Tem certeza que deseja excluir o usuário ${usuario.nome}? Esta ação não pode ser desfeita.`}
                              onConfirm={() => handleDeleteUsuario(usuario._id)}
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
            Mostrando {usuarios.length} de {totalItems} usuários
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Anterior
            </Button>
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages || 1}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
            >
              Próxima
            </Button>
            
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={`${itemsPerPage} por página`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por página</SelectItem>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}