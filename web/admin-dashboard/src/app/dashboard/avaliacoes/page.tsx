"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Loader2, 
  Edit, 
  Eye, 
  Trash2,
  FileText,
  BookOpen, 
  Calendar, 
  GraduationCap 
} from "lucide-react"
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { 
  useAvaliacoes, 
  useCreateAvaliacao, 
  useUpdateAvaliacao, 
  useDeleteAvaliacao 
} from "@/hooks/use-avaliacoes"
import { useDisciplinas } from "@/hooks/use-disciplinas"
import { 
  TipoAvaliacao, 
  Epoca, 
  Trimestre,
  VarianteProva,
  AreaEstudo,
  Avaliacao
} from "@/types/avaliacao"
import { AvaliacaoForm } from "@/components/avaliacoes/avaliacao-form"
import { Disciplina } from "@/types/disciplina"

export default function AvaliacoesPage() {
  const router = useRouter();
  
  // Estado para paginação e filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  
  // Estado para os parâmetros de consulta
  const [queryParams, setQueryParams] = useState({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    tipo: activeFilters["tipo"],
    disciplina: activeFilters["disciplina"],
    ano: activeFilters["ano"] ? parseInt(activeFilters["ano"]) : undefined,
    classe: activeFilters["classe"] ? parseInt(activeFilters["classe"]) : undefined
  });

  // Carregar disciplinas para os filtros
  const { 
    data: disciplinasData,
    isLoading: isLoadingDisciplinas 
  } = useDisciplinas();
  
  const disciplinas = disciplinasData?.data || [];

  // Usar o hook personalizado para gerenciar avaliações
  const { 
    avaliacoes, 
    pagination, 
    isLoading, 
    error,
    refetch
  } = useAvaliacoes(queryParams);

  // Hooks de mutação
  const createAvaliacaoMutation = useCreateAvaliacao();
  const updateAvaliacaoMutation = useUpdateAvaliacao();
  const deleteAvaliacaoMutation = useDeleteAvaliacao();

  // Atualizar os parâmetros de consulta sempre que as dependências mudarem
  useEffect(() => {
    setQueryParams({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery || undefined,
      tipo: activeFilters["tipo"],
      disciplina: activeFilters["disciplina"],
      ano: activeFilters["ano"] ? parseInt(activeFilters["ano"]) : undefined,
      classe: activeFilters["classe"] ? parseInt(activeFilters["classe"]) : undefined
    });
  }, [currentPage, itemsPerPage, searchQuery, activeFilters]);

  // Gerar opções de ano (últimos 5 anos)
  const getAnosOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - i;
      return { value: year.toString(), label: year.toString() };
    });
  };

  // Filtros disponíveis
  const filters = [
    {
      id: "tipo",
      label: "Tipo",
      value: activeFilters["tipo"] || "",
      icon: <FileText className="h-4 w-4" />,
      options: [
        { value: TipoAvaliacao.EXAME, label: "Exame Nacional" },
        { value: TipoAvaliacao.AP, label: "Avaliação Provincial" }
      ]
    },
    {
      id: "disciplina",
      label: "Disciplina",
      value: activeFilters["disciplina"] || "",
      icon: <BookOpen className="h-4 w-4" />,
      options: isLoadingDisciplinas
        ? [{ value: "", label: "Carregando..." }]
        : disciplinas.map((d: Disciplina) => ({
            value: d._id,
            label: d.nome
          }))
    },
    {
      id: "ano",
      label: "Ano",
      value: activeFilters["ano"] || "",
      icon: <Calendar className="h-4 w-4" />,
      options: getAnosOptions()
    },
    {
      id: "classe",
      label: "Classe",
      value: activeFilters["classe"] || "",
      icon: <GraduationCap className="h-4 w-4" />,
      options: [
        { value: "10", label: "10ª" },
        { value: "11", label: "11ª" },
        { value: "12", label: "12ª" }
      ]
    }
  ];

  // Funções para manipular filtros
  const handleFilterChange = (filterId: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
    setCurrentPage(1); // Resetar para primeira página ao filtrar
  }

const handleFilterClear = (filterId: string) => {
  setActiveFilters((prev) => {
    const newFilters = { ...prev };
    delete newFilters[filterId]; 
    return newFilters;
  });
  setCurrentPage(1); 
};
  // Funções para paginação
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  }

  // Funções para busca
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  // Funções para manipulação CRUD
  const handleCreateAvaliacao = async (data: any) => {
    try {
      await createAvaliacaoMutation.mutateAsync(data);
      return true;
    } catch (error) {
      return false;
    }
  }

  const handleUpdateAvaliacao = async (id: string, data: any) => {
    try {
      await updateAvaliacaoMutation.mutateAsync({ id, data });
      return true;
    } catch (error) {
      return false;
    }
  }

  const handleDeleteAvaliacao = async (id: string) => {
    try {
      await deleteAvaliacaoMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Funções para renderização
  const renderTipoBadge = (tipo: TipoAvaliacao) => {
    return tipo === TipoAvaliacao.EXAME
      ? <Badge variant="default">Exame Nacional</Badge>
      : <Badge variant="outline">Avaliação Provincial</Badge>
  }

  const getDisciplinaNome = (id: string) => {
    if (isLoadingDisciplinas) return "Carregando...";
    const disciplina = disciplinas.find((d: Disciplina) => d._id === id);
    return disciplina ? disciplina.nome : "Disciplina não encontrada";
  }

  // Obter valores de paginação
  const totalItems = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <AvaliacaoForm
          onSubmit={handleCreateAvaliacao}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Avaliação
            </Button>
          }
        />
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
          itemsFiltered={avaliacoes.length}
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-destructive">
                    Erro ao carregar avaliações. Tente novamente.
                  </TableCell>
                </TableRow>
              ) : avaliacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma avaliação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                avaliacoes.map((avaliacao: Avaliacao) => {
                  // Determinar o título de exibição - usar o título definido ou gerar um automático
                  const disciplinaNome = typeof avaliacao.disciplina === 'object' && avaliacao.disciplina
                    ? (avaliacao.disciplina as any).nome 
                    : getDisciplinaNome(avaliacao.disciplina as string);
                  
                  const displayTitle = avaliacao.titulo || 
                    `${avaliacao.tipo === TipoAvaliacao.EXAME ? 'Exame' : 'AP'} de ${disciplinaNome} - ${avaliacao.ano} ${
                      avaliacao.tipo === TipoAvaliacao.EXAME 
                        ? `(${avaliacao.epoca} Época)` 
                        : `(${avaliacao.trimestre} Trimestre)`
                    }`;
                  
                  return (
                    <TableRow key={avaliacao._id}>
                      <TableCell className="font-medium">
                        <Link href={`/dashboard/avaliacoes/${avaliacao._id}`} className="hover:underline">
                          {displayTitle}
                        </Link>
                      </TableCell>
                      <TableCell>{disciplinaNome}</TableCell>
                      <TableCell>{avaliacao.ano}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {renderTipoBadge(avaliacao.tipo as TipoAvaliacao)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{avaliacao.classe}ª</TableCell>
                      <TableCell className="text-right">
                        <TableRowActions
                          editTrigger={
                            <DropdownMenuItem asChild>
                              <AvaliacaoForm
                                avaliacao={avaliacao}
                                onSubmit={(data) => handleUpdateAvaliacao(avaliacao._id, data)}
                                trigger={
                                  <button className="w-full text-left flex items-center">
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                  </button>
                                }
                              />
                            </DropdownMenuItem>
                          }
                          viewTrigger={
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/avaliacoes/${avaliacao._id}`} className="w-full flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Ver Detalhes</span>
                              </Link>
                            </DropdownMenuItem>
                          }
                          deleteTrigger={
                            <DropdownMenuItem asChild className="text-destructive hover:bg-destructive hover:text-white focus:bg-destructive focus:text-white">
                              <ConfirmDialog
                                title="Excluir Avaliação"
                                description={`Tem certeza que deseja excluir a avaliação "${displayTitle}"? Esta ação não pode ser desfeita.`}
                                onConfirm={() => {
                                  handleDeleteAvaliacao(avaliacao._id);
                                  return; // Retorna void para atender à tipagem
                                }}
                                trigger={
                                  <button className="w-full text-left flex items-center">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Excluir</span>
                                  </button>
                                }
                              />
                            </DropdownMenuItem>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
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