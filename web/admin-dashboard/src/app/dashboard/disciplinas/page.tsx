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
import { Pagination } from "@/components/ui/pagination"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { ItemsPerPage } from "@/components/ui/items-per-page"
import { TableRowActions } from "@/components/ui/table-row-actions"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge"
import { DisciplinaForm } from "@/components/disciplinas/disciplina-form"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  useDisciplinas,
  useCreateDisciplina,
  useUpdateDisciplina,
  useDeleteDisciplina
} from "@/hooks/use-disciplinas"
import { Disciplina } from "@/types/disciplina"
import { ApiResponse } from "@/types/api" // Importar tipo da API
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"

export default function DisciplinasPage() {
  // Estado para paginação e filtros
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  // Buscar disciplinas com React Query
  const {
    data,
    isLoading,
    error
  } = useDisciplinas({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    status: activeFilters["status"]
  });

  // Mutations para operações CRUD
  const createMutation = useCreateDisciplina();
  const updateMutation = useUpdateDisciplina();
  const deleteMutation = useDeleteDisciplina();

  // Filtros disponíveis
  const filters = [
    {
      id: "status",
      label: "Status",
      value: activeFilters["status"] || "",
      options: [
        { value: "active", label: "Ativo" },
        { value: "inactive", label: "Inativo" }
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
  }

  const handleFilterClear = (filterId: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[filterId]
      return newFilters
    })
    setCurrentPage(1)
  }

  // Funções CRUD
  const handleCreateDisciplina = async (formData: { codigo: string; nome: string; descricao: string; ativo: boolean }) => {
    try {
      await createMutation.mutateAsync(formData);
      return Promise.resolve();
    } catch (error) {
      console.error("Erro ao criar disciplina:", error);
      return Promise.reject(error);
    }
  }

  const handleUpdateDisciplina = async (id: string, formData: { codigo: string; nome: string; descricao: string; ativo: boolean }) => {
    try {
      await updateMutation.mutateAsync({
        id,
        ...formData
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Erro ao atualizar disciplina:", error);
      return Promise.reject(error);
    }
  }

  const handleDeleteDisciplina = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Erro ao excluir disciplina:", error);
      throw error;
    }
  }

  // Renderizar status
  const renderStatusBadge = (ativo: boolean) => {
    return ativo
      ? <Badge variant="success">Ativo</Badge>
      : <Badge variant="secondary">Inativo</Badge>;
  }

  // Usar o tipo correto para a resposta da API
  const apiResponse = data as ApiResponse<Disciplina[]>;
  
  // Disciplinas e paginação
  const disciplinas = apiResponse?.data || [];
  const totalItems = apiResponse?.pagination?.totalItems || 0;
  const totalPages = apiResponse?.pagination?.totalPages || 1;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Disciplinas</h1>
        <DisciplinaForm
          title="Nova Disciplina"
          onSubmit={handleCreateDisciplina}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Disciplina
            </Button>
          }
        />
      </div>

      <div className="space-y-4">
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value)
            setCurrentPage(1)
          }}
          showClearButton={true}
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterClear={handleFilterClear}
          itemsTotal={totalItems}
          itemsFiltered={disciplinas.length}
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-destructive">
                    Erro ao carregar disciplinas. Tente novamente.
                  </TableCell>
                </TableRow>
              ) : disciplinas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhuma disciplina encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                disciplinas.map((disciplina: Disciplina) => (
                  <TableRow key={disciplina._id}>
                    <TableCell className="font-medium">{disciplina.codigo}</TableCell>
                    <TableCell>{disciplina.nome}</TableCell>
                    <TableCell className="hidden md:table-cell">{disciplina.descricao || "—"}</TableCell>
                    <TableCell>{renderStatusBadge(disciplina.ativo)}</TableCell>
                    <TableCell className="text-right">
                      <TableRowActions
                        editTrigger={
                          <DropdownMenuItem asChild>
                            <DisciplinaForm
                              title="Editar Disciplina"
                              disciplina={disciplina}
                              onSubmit={(data) => handleUpdateDisciplina(disciplina._id, data)}
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
                              title="Excluir Disciplina"
                              description={`Tem certeza que deseja excluir a disciplina ${disciplina.nome}? Esta ação não pode ser desfeita.`}
                              onConfirm={() => handleDeleteDisciplina(disciplina._id)}
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <ItemsPerPage
            value={itemsPerPage}
            onChange={(value) => {
              setItemsPerPage(value)
              setCurrentPage(1)
            }}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}