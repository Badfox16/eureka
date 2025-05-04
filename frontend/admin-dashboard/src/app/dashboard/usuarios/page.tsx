"use client"

import { useState, useMemo } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
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

export default function UsuariosPage() {
  // Dados de exemplo que seriam carregados do backend
  const allUsuarios = [
    // Seus 5 exemplos existentes
    { 
      id: 1, 
      nome: "João Silva", 
      email: "joao.silva@exemplo.com", 
      tipo: "ADMIN", 
      status: "Ativo", 
      dataCriacao: "2024-01-15" 
    },
    { 
      id: 2, 
      nome: "Maria Oliveira", 
      email: "maria@exemplo.com", 
      tipo: "PROFESSOR", 
      status: "Ativo", 
      dataCriacao: "2024-02-20" 
    },
    { 
      id: 3, 
      nome: "Pedro Santos", 
      email: "pedro@exemplo.com", 
      tipo: "NORMAL", 
      status: "Inativo", 
      dataCriacao: "2024-03-10" 
    },
    { 
      id: 4, 
      nome: "Ana Pereira", 
      email: "ana@exemplo.com", 
      tipo: "PROFESSOR", 
      status: "Ativo", 
      dataCriacao: "2024-04-05" 
    },
    { 
      id: 5, 
      nome: "Carlos Ferreira", 
      email: "carlos@exemplo.com", 
      tipo: "NORMAL", 
      status: "Ativo", 
      dataCriacao: "2024-05-01" 
    },
    // Adicione mais exemplos para testar paginação
    { 
      id: 6, 
      nome: "Lúcia Mendes", 
      email: "lucia@exemplo.com", 
      tipo: "PROFESSOR", 
      status: "Ativo", 
      dataCriacao: "2024-05-01" 
    },
    { 
      id: 7, 
      nome: "Ricardo Oliveira", 
      email: "ricardo@exemplo.com", 
      tipo: "NORMAL", 
      status: "Inativo", 
      dataCriacao: "2024-05-01" 
    },
    // adicione mais conforme necessário...
  ]

  // Estado para a tabela
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  // Filtros disponíveis
  const filters = [
    {
      id: "tipo",
      label: "Tipo",
      value: activeFilters["tipo"] || "",
      options: [
        { value: "ADMIN", label: "Admin" },
        { value: "PROFESSOR", label: "Professor" },
        { value: "NORMAL", label: "Normal" },
      ]
    },
    {
      id: "status",
      label: "Status",
      value: activeFilters["status"] || "",
      options: [
        { value: "Ativo", label: "Ativo" },
        { value: "Inativo", label: "Inativo" },
      ]
    }
  ]

  // Aplicar filtros aos dados
  const filteredUsuarios = useMemo(() => {
    return allUsuarios.filter((usuario) => {
      // Filtro de pesquisa em múltiplos campos
      const matchesSearch = searchQuery
        ? usuario.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          usuario.email.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      // Filtros específicos
      const matchesTipo = activeFilters["tipo"]
        ? usuario.tipo === activeFilters["tipo"]
        : true

      const matchesStatus = activeFilters["status"]
        ? usuario.status === activeFilters["status"]
        : true

      return matchesSearch && matchesTipo && matchesStatus
    })
  }, [allUsuarios, searchQuery, activeFilters])

  // Paginação
  const paginatedUsuarios = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredUsuarios.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredUsuarios, currentPage, itemsPerPage])

  // Total de páginas
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage)

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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
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
          itemsTotal={allUsuarios.length}
          itemsFiltered={filteredUsuarios.length}
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsuarios.length > 0 ? (
                paginatedUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge 
                        variant={
                          usuario.tipo === "ADMIN" 
                            ? "destructive" 
                            : usuario.tipo === "PROFESSOR" 
                              ? "default" 
                              : "outline"
                        }
                      >
                        {usuario.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge 
                        variant={usuario.status === "Ativo" ? "success" : "secondary"}
                      >
                        {usuario.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TableRowActions
                        onView={() => console.log(`Visualizar ${usuario.nome}`)}
                        onEdit={() => console.log(`Editar ${usuario.nome}`)}
                        onDelete={() => console.log(`Excluir ${usuario.nome}`)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
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