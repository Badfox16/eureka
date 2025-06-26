"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Edit, Trash } from "lucide-react"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { Pagination } from "@/components/ui/pagination"
import { ItemsPerPage } from "@/components/ui/items-per-page"
import { TableRowActions } from "@/components/ui/table-row-actions"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { UsuarioForm } from "@/components/usuarios/usuario-form"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Usuario, CreateUsuarioInput, UpdateUsuarioInput } from "@/types/usuario"
import { TipoUsuario } from "@/types"
import { formatDate } from "@/lib/utils"
import { hasRole } from "@/lib/auth"
import { useUsuarios } from "@/hooks/use-usuarios"

export default function UsuariosPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const canEdit = hasRole(TipoUsuario.ADMIN)

  const { 
    usuarios,
    isLoading, 
    error,
    pagination,
    updateQueryParams,
    createUsuario,
    updateUsuario,
    deleteUsuario
  } = useUsuarios({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    tipo: activeFilters["tipo"]
  });

  const filters = [
    {
      id: "tipo",
      label: "Tipo",
      value: activeFilters["tipo"] || "",
      options: [
        { value: TipoUsuario.ADMIN, label: "Administrador" },
        { value: TipoUsuario.PROFESSOR, label: "Professor" },
        { value: TipoUsuario.NORMAL, label: "Aluno" }
      ]
    }
  ]

  const handleFilterChange = (filterId: string, value: string) => {
    const newFilters = { ...activeFilters, [filterId]: value };
    setActiveFilters(newFilters);
    setCurrentPage(1);
    updateQueryParams({ ...newFilters, page: 1 });
  }

  const handleFilterClear = (filterId: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterId];
    setActiveFilters(newFilters);
    setCurrentPage(1);
    updateQueryParams({ ...newFilters, [filterId]: undefined, page: 1 });
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateQueryParams({ page });
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
    updateQueryParams({ limit, page: 1 });
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    updateQueryParams({ search: value || undefined, page: 1 });
  }
  
  const handleCreateUsuario = async (data: CreateUsuarioInput) => {
    await createUsuario(data)
  }

  const handleUpdateUsuario = async (id: string, data: UpdateUsuarioInput) => {
    await updateUsuario({ id, data })
  }

  const handleDeleteUsuario = async (id: string) => {
    await deleteUsuario(id)
  }

  const renderTipoBadge = (tipo: TipoUsuario) => {
    switch (tipo) {
      case TipoUsuario.ADMIN: return <Badge variant="default">Administrador</Badge>
      case TipoUsuario.PROFESSOR: return <Badge variant="outline">Professor</Badge>
      case TipoUsuario.NORMAL: return <Badge variant="secondary">Aluno</Badge>
      default: return <Badge>{tipo}</Badge>
    }
  }

  const totalItems = pagination?.total || 0
  const totalPages = pagination?.totalPages || 1

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        {canEdit && (
          <UsuarioForm
            title="Novo Usuário"
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

      <div className="space-y-4">
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterClear={handleFilterClear}
          itemsTotal={totalItems}
          itemsFiltered={usuarios.length}
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Data de Criação</TableHead>
                {canEdit && <TableHead className="w-24 text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={canEdit ? 5 : 4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" /></TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={canEdit ? 5 : 4} className="h-24 text-center text-destructive">Erro ao carregar usuários.</TableCell></TableRow>
              ) : usuarios.length === 0 ? (
                <TableRow><TableCell colSpan={canEdit ? 5 : 4} className="h-24 text-center">Nenhum usuário encontrado.</TableCell></TableRow>
              ) : (
                usuarios.map((usuario: Usuario) => (
                  <TableRow key={usuario._id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>{renderTipoBadge(usuario.tipo)}</TableCell>
                    <TableCell className="hidden md:table-cell">{usuario.createdAt ? formatDate(usuario.createdAt) : '—'}</TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <TableRowActions
                          editTrigger={
                            <UsuarioForm
                              title="Editar Usuário"
                              usuario={usuario}
                              onSubmit={(data) => handleUpdateUsuario(usuario._id, data)}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Editar</span>
                                </DropdownMenuItem>
                              }
                            />
                          }
                          deleteTrigger={
                            <ConfirmDialog
                              title="Excluir Usuário"
                              description={`Tem certeza que deseja excluir o usuário ${usuario.nome}?`}
                              onConfirm={() => handleDeleteUsuario(usuario._id)}
                              trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center text-destructive">
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Excluir</span>
                                </DropdownMenuItem>
                              }
                            />
                          }
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <ItemsPerPage
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}