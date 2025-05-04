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
import { Pagination } from "@/components/ui/pagination"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { ItemsPerPage } from "@/components/ui/items-per-page"
import { TableRowActions } from "@/components/ui/table-row-actions"

export default function DisciplinasPage() {
  // Dados de exemplo que seriam carregados do backend
  const allDisciplinas = [
    { id: 1, codigo: "MAT", nome: "Matemática", descricao: "Estudo de números, quantidades, formas, estruturas e suas relações." },
    { id: 2, codigo: "FIS", nome: "Física", descricao: "Ciência que estuda as propriedades da matéria, energia, espaço e tempo." },
    { id: 3, codigo: "QUI", nome: "Química", descricao: "Estudo da composição, estrutura, propriedades e transformações da matéria." },
    { id: 4, codigo: "BIO", nome: "Biologia", descricao: "Ciência que estuda os seres vivos e suas interações com o meio ambiente." },
    { id: 5, codigo: "HIS", nome: "História", descricao: "Estudo sistemático do passado humano, suas sociedades e civilizações." },
    { id: 6, codigo: "GEO", nome: "Geografia", descricao: "Ciência que estuda o espaço geográfico e suas transformações." },
    { id: 7, codigo: "POR", nome: "Português", descricao: "Estudo da língua portuguesa em suas dimensões linguísticas e literárias." },
    { id: 8, codigo: "ING", nome: "Inglês", descricao: "Estudo da língua inglesa e suas aplicações no contexto global." },
    { id: 9, codigo: "FIL", nome: "Filosofia", descricao: "Estudo crítico e reflexivo do conhecimento, valores e existência humana." },
    { id: 10, codigo: "PSI", nome: "Psicologia", descricao: "Ciência que estuda os processos mentais e comportamentais dos indivíduos." },
    { id: 11, codigo: "SOC", nome: "Sociologia", descricao: "Estudo das relações sociais, instituições e estruturas da sociedade." },
    { id: 12, codigo: "ECO", nome: "Economia", descricao: "Estudo da produção, distribuição e consumo de bens e serviços." },
  ]

  // Estado para a tabela
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  // Filtros disponíveis
  const filters = [
    {
      id: "codigo",
      label: "Código",
      value: activeFilters["codigo"] || "",
    }
  ]

  // Aplicar filtros aos dados
  const filteredDisciplinas = useMemo(() => {
    return allDisciplinas.filter((disciplina) => {
      // Filtro de pesquisa em múltiplos campos
      const matchesSearch = searchQuery
        ? disciplina.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
          disciplina.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          disciplina.descricao.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      // Filtros específicos
      const matchesCodigo = activeFilters["codigo"]
        ? disciplina.codigo.toLowerCase().includes(activeFilters["codigo"].toLowerCase())
        : true

      return matchesSearch && matchesCodigo
    })
  }, [allDisciplinas, searchQuery, activeFilters])

  // Paginação
  const paginatedDisciplinas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredDisciplinas.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredDisciplinas, currentPage, itemsPerPage])

  // Total de páginas
  const totalPages = Math.ceil(filteredDisciplinas.length / itemsPerPage)

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
        <h1 className="text-2xl font-bold">Disciplinas</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Disciplina
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
          itemsTotal={allDisciplinas.length}
          itemsFiltered={filteredDisciplinas.length}
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">Descrição</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDisciplinas.length > 0 ? (
                paginatedDisciplinas.map((disciplina) => (
                  <TableRow key={disciplina.id}>
                    <TableCell className="font-medium">{disciplina.codigo}</TableCell>
                    <TableCell>{disciplina.nome}</TableCell>
                    <TableCell className="hidden md:table-cell">{disciplina.descricao}</TableCell>
                    <TableCell className="text-right">
                      <TableRowActions
                        onView={() => console.log(`Visualizar ${disciplina.nome}`)}
                        onEdit={() => console.log(`Editar ${disciplina.nome}`)}
                        onDelete={() => console.log(`Excluir ${disciplina.nome}`)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhuma disciplina encontrada.
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