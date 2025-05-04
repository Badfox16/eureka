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

export default function AvaliacoesPage() {
  // Dados de exemplo que seriam carregados do backend
  const allAvaliacoes = [
    // Seus 5 exemplos existentes, mais outros para testar a paginação
    { 
      id: 1, 
      titulo: "Exame Nacional de Matemática", 
      disciplina: "Matemática", 
      ano: 2024, 
      tipo: "Exame Nacional", 
      classe: 12, 
      epoca: "1ª Época" 
    },
    { 
      id: 2, 
      titulo: "Avaliação Provincial de Física", 
      disciplina: "Física", 
      ano: 2024, 
      tipo: "Avaliação Provincial", 
      classe: 12, 
      provincia: "Luanda",
      trimestre: "2º Trimestre" 
    },
    { 
      id: 3, 
      titulo: "Exame Nacional de Química", 
      disciplina: "Química", 
      ano: 2023, 
      tipo: "Exame Nacional", 
      classe: 12, 
      epoca: "2ª Época" 
    },
    { 
      id: 4, 
      titulo: "Avaliação Provincial de História", 
      disciplina: "História", 
      ano: 2024, 
      tipo: "Avaliação Provincial", 
      classe: 11, 
      provincia: "Benguela",
      trimestre: "1º Trimestre" 
    },
    { 
      id: 5, 
      titulo: "Exame Nacional de Biologia", 
      disciplina: "Biologia", 
      ano: 2023, 
      tipo: "Exame Nacional", 
      classe: 12,
      epoca: "1ª Época" 
    },
    // Adicione mais exemplos para testar paginação
    { 
      id: 6, 
      titulo: "Avaliação Provincial de Geografia", 
      disciplina: "Geografia", 
      ano: 2024, 
      tipo: "Avaliação Provincial", 
      classe: 10, 
      provincia: "Huambo",
      trimestre: "3º Trimestre" 
    },
    { 
      id: 7, 
      titulo: "Exame Nacional de Português", 
      disciplina: "Português", 
      ano: 2024, 
      tipo: "Exame Nacional", 
      classe: 12, 
      epoca: "1ª Época" 
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
      id: "disciplina",
      label: "Disciplina",
      value: activeFilters["disciplina"] || "",
      options: [
        { value: "Matemática", label: "Matemática" },
        { value: "Física", label: "Física" },
        { value: "Química", label: "Química" },
        { value: "Biologia", label: "Biologia" },
        { value: "História", label: "História" },
        { value: "Geografia", label: "Geografia" },
        { value: "Português", label: "Português" },
      ]
    },
    {
      id: "tipo",
      label: "Tipo",
      value: activeFilters["tipo"] || "",
      options: [
        { value: "Exame Nacional", label: "Exame Nacional" },
        { value: "Avaliação Provincial", label: "Avaliação Provincial" },
      ]
    },
    {
      id: "ano",
      label: "Ano",
      value: activeFilters["ano"] || "",
      options: [
        { value: "2024", label: "2024" },
        { value: "2023", label: "2023" },
        { value: "2022", label: "2022" },
      ]
    },
    {
      id: "classe",
      label: "Classe",
      value: activeFilters["classe"] || "",
      options: [
        { value: "10", label: "10ª" },
        { value: "11", label: "11ª" },
        { value: "12", label: "12ª" },
      ]
    }
  ]

  // Aplicar filtros aos dados
  const filteredAvaliacoes = useMemo(() => {
    return allAvaliacoes.filter((avaliacao) => {
      // Filtro de pesquisa em múltiplos campos
      const matchesSearch = searchQuery
        ? avaliacao.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          avaliacao.disciplina.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      // Filtros específicos
      const matchesDisciplina = activeFilters["disciplina"]
        ? avaliacao.disciplina === activeFilters["disciplina"]
        : true

      const matchesTipo = activeFilters["tipo"]
        ? avaliacao.tipo === activeFilters["tipo"]
        : true

      const matchesAno = activeFilters["ano"]
        ? avaliacao.ano.toString() === activeFilters["ano"]
        : true

      const matchesClasse = activeFilters["classe"]
        ? avaliacao.classe.toString() === activeFilters["classe"]
        : true

      return matchesSearch && matchesDisciplina && matchesTipo && matchesAno && matchesClasse
    })
  }, [allAvaliacoes, searchQuery, activeFilters])

  // Paginação
  const paginatedAvaliacoes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAvaliacoes.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAvaliacoes, currentPage, itemsPerPage])

  // Total de páginas
  const totalPages = Math.ceil(filteredAvaliacoes.length / itemsPerPage)

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
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Avaliação
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
          itemsTotal={allAvaliacoes.length}
          itemsFiltered={filteredAvaliacoes.length}
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Classe</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAvaliacoes.length > 0 ? (
                paginatedAvaliacoes.map((avaliacao) => (
                  <TableRow key={avaliacao.id}>
                    <TableCell className="font-medium">{avaliacao.titulo}</TableCell>
                    <TableCell>{avaliacao.disciplina}</TableCell>
                    <TableCell>{avaliacao.ano}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={avaliacao.tipo === "Exame Nacional" ? "default" : "outline"}>
                        {avaliacao.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{avaliacao.classe}ª</TableCell>
                    <TableCell className="text-right">
                      <TableRowActions
                        onView={() => console.log(`Visualizar ${avaliacao.titulo}`)}
                        onEdit={() => console.log(`Editar ${avaliacao.titulo}`)}
                        onDelete={() => console.log(`Excluir ${avaliacao.titulo}`)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma avaliação encontrada.
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