"use client"

import { useState, useEffect } from "react"
import { useQuestoes } from "@/hooks/use-questoes"
import { QuestaoCard } from "./questao-card"
import { QuestaoForm } from "./questao-form"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { Pagination } from "@/components/ui/pagination"
import { ItemsPerPage } from "@/components/ui/items-per-page"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { Filter } from "@/components/ui/table-toolbar"
import { CreateQuestaoInput, Questao } from "@/types/questao"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface QuestaoListProps {
    avaliacaoId?: string
    disciplinaId?: string
    questoes: Questao[] // Adicionamos esta prop para receber questões diretamente
    isLoading?: boolean // Adicionamos esta prop para controle de carregamento externo
    onAddToAvaliacao?: (questaoId: string) => void
    onRemoveFromAvaliacao?: (questaoId: string) => void
    actionMode?: "add" | "remove" | "view" | "edit"
    showCreateButton?: boolean
    hideFilters?: boolean
    onCreateSuccess?: (questao: Questao) => void
    onUpdateSuccess?: (questao: Questao) => void
    onDeleteSuccess?: () => void
    onUpdate?: (id: string) => React.ReactNode
    onView?: (id: string) => React.ReactNode // Nova prop para visualização
    onDelete?: (id: string) => void
}

export function QuestaoList({
    avaliacaoId,
    disciplinaId,
    questoes,
    isLoading,
    onAddToAvaliacao,
    onRemoveFromAvaliacao,
    actionMode = "view",
    showCreateButton = true,
    hideFilters = false,
    onCreateSuccess,
    onUpdateSuccess,
    onDeleteSuccess,
    onUpdate,
    onView,
    onDelete
}: QuestaoListProps) {
    // Estado para paginação e filtros
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
        ...(disciplinaId ? { disciplina: disciplinaId } : {})
    })

    // Reseta para a primeira página quando filtros mudam
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, activeFilters])

    // Configurar os parâmetros de consulta
    const queryParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        ...activeFilters,
        ...(avaliacaoId && actionMode === "remove" ? { avaliacaoId } : {}),
        ...(avaliacaoId && actionMode === "add" ? { notInAvaliacao: avaliacaoId } : {})
    }

    // Buscar questões com React Query
    const {
        pagination,
        error,
        refetch
    } = useQuestoes(queryParams)

    // Filtros disponíveis
    const filters: Filter[] = [
        {
            id: "disciplina",
            label: "Disciplina",
            value: activeFilters["disciplina"] || "",
            options: [
                { value: "", label: "Todas" },
                { value: "MAT", label: "Matemática" },
                { value: "POR", label: "Português" },
                { value: "FIS", label: "Física" },
                // Adicione outras disciplinas conforme necessário
            ]
        }
    ]

    // Funções para manipular filtros
    const handleFilterChange = (filterId: string, value: string) => {
        setActiveFilters((prev) => ({
            ...prev,
            [filterId]: value,
        }))
    }

    const handleFilterClear = (filterId: string) => {
        setActiveFilters((prev) => {
            const newFilters = { ...prev }
            delete newFilters[filterId]
            return newFilters
        })
    }

    // Criar nova questão
    const handleCreateQuestao = async (data: CreateQuestaoInput) => {
        try {
            // Implementar lógica de criação com seu hook useCreateQuestao
            // const response = await createQuestaoMutation.mutateAsync(data);
            // if (onCreateSuccess) onCreateSuccess(response);
            return Promise.resolve()
        } catch (error: any) {
            return Promise.reject(error)
        }
    }

    // Editar questão
    const handleEditQuestao = (questao: Questao) => {
        // Implementar lógica de edição
        console.log("Editar questão", questao)
    }

    // Excluir questão
    const handleDeleteQuestao = (questaoId: string) => {
        // Implementar lógica de exclusão com seu hook useDeleteQuestao
        console.log("Excluir questão", questaoId)
    }

    return (
        <div className="space-y-4">
            {!hideFilters && (
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <TableToolbar
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        filters={filters}
                        activeFilters={activeFilters}
                        onFilterChange={handleFilterChange}
                        onFilterClear={handleFilterClear}
                        itemsTotal={pagination?.total}
                        itemsFiltered={questoes.length}
                    />

                    {showCreateButton && (
                        <QuestaoForm
                            avaliacaoId={avaliacaoId}
                            onSubmit={handleCreateQuestao}
                            title="Nova Questão"
                            trigger={
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nova Questão
                                </Button>
                            }
                        />
                    )}
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="py-8 text-center text-destructive">
                    Erro ao carregar questões. Tente novamente.
                </div>
            ) : questoes.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                    Nenhuma questão encontrada.
                </div>
            ) : (
                <div className="space-y-4">
                    {questoes.map((questao) => (
                        <QuestaoCard
                            key={questao._id}
                            questao={questao}
                            showActions={true}
                            actionMode={actionMode}
                            onEdit={() => {
                                if (onUpdate) {
                                    const component = onUpdate(questao._id);
                                    if (component) {
                                        return component;
                                    }
                                }
                                handleEditQuestao(questao);
                            }}
                            onView={() => {
                                if (onView) {
                                    const component = onView(questao._id);
                                    if (component) {
                                        return component;
                                    }
                                }
                                return null;
                            }}
                            onDelete={() => onDelete && onDelete(questao._id)}
                            onAddToAvaliacao={onAddToAvaliacao}
                            onRemoveFromAvaliacao={onRemoveFromAvaliacao}
                        />
                    ))}

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                        <ItemsPerPage
                            value={itemsPerPage}
                            onChange={(value) => {
                                setItemsPerPage(value)
                                setCurrentPage(1)
                            }}
                        />

                        <Pagination
                            currentPage={currentPage}
                            totalPages={pagination?.totalPages || 1}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}