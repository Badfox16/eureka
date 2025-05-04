"use client"

import { useState, useMemo } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
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

export default function ProvinciasPage() {
  // Dados de exemplo que seriam carregados do backend
  const allProvincias = [
    { id: 1, nome: "Luanda", codigo: "LDA", regiao: "Norte" },
    { id: 2, nome: "Benguela", codigo: "BG", regiao: "Centro" },
    { id: 3, nome: "Huambo", codigo: "HB", regiao: "Centro" },
    { id: 4, nome: "Malanje", codigo: "MLA", regiao: "Norte" },
    { id: 5, nome: "Namibe", codigo: "NMB", regiao: "Sul" },
    { id: 6, nome: "Huíla", codigo: "HLA", regiao: "Sul" },
    { id: 7, nome: "Bié", codigo: "BIE", regiao: "Centro" },
    { id: 8, nome: "Uíge", codigo: "UIG", regiao: "Norte" },
    { id: 9, nome: "Cabinda", codigo: "CAB", regiao: "Norte" },
    { id: 10, nome: "Zaire", codigo: "ZAI", regiao: "Norte" },
    { id: 11, nome: "Lunda Norte", codigo: "LNO", regiao: "Leste" },
    { id: 12, nome: "Lunda Sul", codigo: "LSU", regiao: "Leste" },
    { id: 13, nome: "Moxico", codigo: "MOX", regiao: "Leste" },
    { id: 14, nome: "Cuando Cubango", codigo: "CCU", regiao: "Leste" },
    { id: 15, nome: "Cuanza Norte", codigo: "CNO", regiao: "Norte" },
    { id: 16, nome: "Cuanza Sul", codigo: "CSU", regiao: "Centro" },
    { id: 17, nome: "Bengo", codigo: "BEN", regiao: "Norte" },
    { id: 18, nome: "Cunene", codigo: "CUN", regiao: "Sul" },
  ]

  // Estado para a tabela
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

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
        { value: "Leste", label: "Leste" },
      ]
    }
  ]

  // Aplicar filtros aos dados
  const filteredProvincias = useMemo(() => {
    return allProvincias.filter((provincia) => {
      // Filtro de pesquisa em múltiplos campos
      const matchesSearch = searchQuery
        ? provincia.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provincia.codigo.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      // Filtros específicos
      const matchesRegiao = activeFilters["regiao"]
        ? provincia.regiao === activeFilters["regiao"]
        : true

      return matchesSearch && matchesRegiao
    })
  }, [allProvincias, searchQuery, activeFilters])

  // Paginação
  const paginatedProvincias = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredProvincias.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProvincias, currentPage, itemsPerPage])

  // Total de páginas
  const totalPages = Math.ceil(filteredProvincias.length / itemsPerPage)

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
        <h1 className="text-2xl font-bold">Províncias</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Província
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
          itemsTotal={allProvincias.length}
          itemsFiltered={filteredProvincias.length}
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
              {paginatedProvincias.length > 0 ? (
                paginatedProvincias.map((provincia) => (
                  <TableRow key={provincia.id}>
                    <TableCell className="font-medium">{provincia.nome}</TableCell>
                    <TableCell>{provincia.codigo}</TableCell>
                    <TableCell className="hidden md:table-cell">{provincia.regiao}</TableCell>
                    <TableCell className="text-right">
                      <TableRowActions
                        onView={() => console.log(`Visualizar ${provincia.nome}`)}
                        onEdit={() => console.log(`Editar ${provincia.nome}`)}
                        onDelete={() => console.log(`Excluir ${provincia.nome}`)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhuma província encontrada.
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