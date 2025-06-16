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
import { Usuario } from "@/types/usuario"
import { TipoUsuario } from "@/types"
import { formatDate } from "@/lib/utils"
import { hasRole } from "@/lib/auth"
import { useUsuarios } from "@/hooks/use-usuarios"
import { toast } from "sonner"

export default function UsuariosPage() {
  // Estado para paginação e filtros
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  // Verificar se o usuário atual tem permissão para editar
  const canEdit = hasRole(TipoUsuario.ADMIN)

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
  } = useUsuarios({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    tipo: activeFilters["tipo"]
  })

  // Filtros disponíveis
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

  // Funções para manipular filtros
  const handleFilterChange = (filterId: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }))
    setCurrentPage(1) // Resetar para primeira página ao filtrar
    updateQueryParams({ tipo: value, page: 1 })
  }

  const handleFilterClear = (filterId: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[filterId]
      return newFilters
    })
    setCurrentPage(1)
    updateQueryParams({ tipo: undefined, page: 1 })
  }

  // Sincronizar alterações de paginação com os queryParams
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateQueryParams({ page })
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
    setCurrentPage(1)
    updateQueryParams({ limit, page: 1 })
  }

  // Sincronizar busca com queryParams
  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
    updateQueryParams({ search: value || undefined, page: 1 })
  }

  // Funções CRUD
  const handleCreateUsuario = async (data: {
    nome: string;
    email: string;
    password?: string;
    tipo: TipoUsuario;
  }) => {
    try {
      await createUsuario({
        nome: data.nome,
        email: data.email,
        password: data.password || '',
        tipo: data.tipo
      })
      toast.success("Usuário criado com sucesso!")
      return Promise.resolve()
    } catch (error: any) {
      toast.error(`Erro ao criar usuário: ${error.message}`)
      return Promise.reject(error)
    }
  }

  const handleUpdateUsuario = async (id: string, data: {
    nome?: string;
    email?: string;
    password?: string;
    tipo?: TipoUsuario;
  }) => {
    try {
      await updateUsuario({
        id,
        data
      })
      toast.success("Usuário atualizado com sucesso!")
      return Promise.resolve()
    } catch (error: any) {
      toast.error(`Erro ao atualizar usuário: ${error.message}`)
      return Promise.reject(error)
    }
  }

  const handleDeleteUsuario = async (id: string) => {
    try {
      await deleteUsuario(id)
      toast.success("Usuário excluído com sucesso!")
    } catch (error: any) {
      toast.error(`Erro ao excluir usuário: ${error.message}`)
    }
  }

  // Renderizar badge por tipo de usuário
  const renderTipoBadge = (tipo: TipoUsuario) => {
    switch (tipo) {
      case TipoUsuario.ADMIN:
        return <Badge variant="default">Administrador</Badge>
      case TipoUsuario.PROFESSOR:
        return <Badge variant="outline">Professor</Badge>
      case TipoUsuario.NORMAL:
        return <Badge variant="secondary">Aluno</Badge>
      default:
        return <Badge>{tipo}</Badge>
    }
  }

  // Usuários e paginação - com validação segura para evitar erros
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
          showClearButton={true}
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
                <TableRow>
                  <TableCell colSpan={canEdit ? 5 : 4} className="h-24 text-center">
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 5 : 4} className="h-24 text-center text-destructive">
                    Erro ao carregar usuários. Tente novamente.
                  </TableCell>
                </TableRow>
              ) : usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 5 : 4} className="h-24 text-center">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
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
                            <DropdownMenuItem asChild>
                              <UsuarioForm
                                title="Editar Usuário"
                                usuario={usuario}
                                onSubmit={(data) => handleUpdateUsuario(usuario._id, data)}
                                trigger={
                                  <div className="flex w-full items-center">
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                  </div>
                                }
                              />
                            </DropdownMenuItem>
                          }
                          deleteTrigger={
                            <DropdownMenuItem
                              asChild
                              className="text-destructive hover:bg-destructive hover:text-white focus:bg-destructive focus:text-white"
                            >
                              <ConfirmDialog
                                title="Excluir Usuário"
                                description={`Tem certeza que deseja excluir o usuário ${usuario.nome}? Esta ação não pode ser desfeita.`}
                                onConfirm={() => handleDeleteUsuario(usuario._id)}
                                trigger={
                                  <div className="flex w-full items-center">
                                    <Trash className="mr-2 h-4 w-4" />
                                    <span>Excluir</span>
                                  </div>
                                }
                              />
                            </DropdownMenuItem>
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