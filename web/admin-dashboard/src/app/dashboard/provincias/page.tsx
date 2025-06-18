"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, Edit, Trash } from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ProvinciaForm } from "@/components/provincias/provincia-form"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { 
  useProvincias, 
  useCreateProvincia, 
  useUpdateProvincia, 
  useDeleteProvincia 
} from "@/hooks/use-provincias"
import { toast } from "sonner"
import { Provincia } from "@/types/provincia"
import { ApiResponse } from "@/types/api"

export default function ProvinciasPage() {
  // Estado para paginação e filtros
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  // Buscar provincias com React Query
  const { 
    data, 
    isLoading, 
    error 
  } = useProvincias({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    regiao: activeFilters["regiao"]
  });

  // Log para depuração
  useEffect(() => {
    console.log('API Response:', data);
    console.log('Pagination:', data?.pagination);
    console.log('Total Items:', data?.pagination?.total);
  }, [data]);

  // Mutations para operações CRUD
  const createMutation = useCreateProvincia();
  const updateMutation = useUpdateProvincia();
  const deleteMutation = useDeleteProvincia();

  // Filtros disponíveis
  const filters = [
    {
      id: "regiao",
      label: "Região",
      value: activeFilters["regiao"] || "",
      options: [
        { value: "Norte", label: "Norte" },
        { value: "Centro", label: "Centro" },
        { value: "Sul", label: "Sul" },
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
  const handleCreateProvincia = async (data: { nome: string; codigo: string; regiao: string }) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Província criada com sucesso!");
      return Promise.resolve();
    } catch (error: any) {
      toast.error(`Erro ao criar província: ${error.message}`);
      return Promise.reject(error);
    }
  }

  const handleUpdateProvincia = async (id: string, data: { nome: string; codigo: string; regiao: string }) => {
    try {
      await updateMutation.mutateAsync({ id, ...data });
      toast.success("Província atualizada com sucesso!");
      return Promise.resolve();
    } catch (error: any) {
      toast.error(`Erro ao atualizar província: ${error.message}`);
      return Promise.reject(error);
    }
  }

  const handleDeleteProvincia = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Província excluída com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao excluir província: ${error.message}`);
    }
  }

  // Usar o tipo correto para a resposta da API
  const apiResponse = data as ApiResponse<Provincia[]>;
  
  // Provincias e paginação
  const provincias = apiResponse?.data || [];
  const total = apiResponse?.pagination?.total || 0;
  const totalPages = apiResponse?.pagination?.totalPages || 1;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Províncias</h1>
        <ProvinciaForm
          title="Nova Província"
          onSubmit={handleCreateProvincia}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Província
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
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onFilterClear={handleFilterClear}
          itemsTotal={total}
          itemsFiltered={provincias.length}
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="hidden md:table-cell">Região</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-destructive">
                    Erro ao carregar províncias. Tente novamente.
                  </TableCell>
                </TableRow>
              ) : provincias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhuma província encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                provincias.map((provincia: Provincia) => (
                  <TableRow key={provincia._id}>
                    <TableCell className="font-medium">{provincia.nome}</TableCell>
                    <TableCell>{provincia.codigo}</TableCell>
                    <TableCell className="hidden md:table-cell">{provincia.regiao}</TableCell>
                    <TableCell className="text-right">
                      <TableRowActions
                        editTrigger={
                          <DropdownMenuItem asChild>
                            <ProvinciaForm
                              title="Editar Província"
                              provincia={provincia}
                              onSubmit={(data) => handleUpdateProvincia(provincia._id, data)}
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
                              title="Excluir Província"
                              description={`Tem certeza que deseja excluir a província ${provincia.nome}? Esta ação não pode ser desfeita.`}
                              onConfirm={() => handleDeleteProvincia(provincia._id)}
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

        <div className="text-sm text-muted-foreground">
          Mostrando {provincias.length} de {total} províncias
        </div>
      </div>
    </DashboardLayout>
  )
}