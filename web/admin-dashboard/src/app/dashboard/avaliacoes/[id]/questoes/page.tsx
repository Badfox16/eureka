"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Loader2, 
  Edit, 
  Eye, 
  Trash2,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { useAvaliacao } from '@/hooks/use-avaliacoes'
import { 
  useQuestoes, 
  useAddQuestaoToAvaliacao, 
  useRemoveQuestaoFromAvaliacao 
} from '@/hooks/use-questoes'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableToolbar } from '@/components/ui/table-toolbar'
import { Pagination } from '@/components/ui/pagination'
import { ItemsPerPage } from '@/components/ui/items-per-page'
import { TableRowActions } from '@/components/ui/table-row-actions'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { TipoAvaliacao } from '@/types/avaliacao'
import { Questao } from '@/types/questao'
import { toast } from 'sonner'

// Componente para o card de questão
function QuestaoCard({ 
  questao, 
  isAssociated = false,
  onAddToAvaliacao,
  onRemoveFromAvaliacao
}: { 
  questao: Questao; 
  isAssociated?: boolean;
  onAddToAvaliacao?: (questaoId: string) => void;
  onRemoveFromAvaliacao?: (questaoId: string) => void;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex justify-between mb-2">
          <Badge variant={isAssociated ? "default" : "outline"}>
            Questão {questao.numero || ''}
          </Badge>
          {questao.valor !== undefined && (
            <Badge variant="secondary">
              Valor: {questao.valor}
            </Badge>
          )}
        </div>
        
        <div className="mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: questao.enunciado }} />
        
        {questao.alternativas && questao.alternativas.length > 0 && (
          <div className="mb-4 text-sm text-muted-foreground">
            {questao.alternativas.length} alternativas
          </div>
        )}
        
        <div className="flex justify-end mt-auto pt-2">
          {isAssociated ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onRemoveFromAvaliacao?.(questao._id)}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Remover
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onAddToAvaliacao?.(questao._id)}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AvaliacaoQuestoesPage() {
  const params = useParams()
  const router = useRouter()
  const avaliacaoId = params.id as string
  
  // Estado para paginação e filtros
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("associadas")
  
  // Carregar dados da avaliação
  const { avaliacao, isLoading: isLoadingAvaliacao } = useAvaliacao(avaliacaoId)
  
  // Carregar questões associadas
  const { 
    questoes: questoesAssociadas, 
    isLoading: isLoadingQuestoesAssociadas,
    pagination: paginationAssociadas
  } = useQuestoes({
    avaliacaoId,
    page: activeTab === "associadas" ? currentPage : 1,
    limit: activeTab === "associadas" ? itemsPerPage : 100
  })
  
  // Carregar questões disponíveis (não associadas)
  const { 
    questoes: questoesDisponiveis, 
    isLoading: isLoadingQuestoesDisponiveis,
    pagination: paginationDisponiveis
  } = useQuestoes({
    notInAvaliacao: avaliacaoId,
    search: searchQuery,
    page: activeTab === "disponiveis" ? currentPage : 1,
    limit: activeTab === "disponiveis" ? itemsPerPage : 10
  })
  
  // Mutações para adicionar/remover questões
  const addQuestaoMutation = useAddQuestaoToAvaliacao()
  const removeQuestaoMutation = useRemoveQuestaoFromAvaliacao()

  // Manipuladores de eventos
  const handleAddQuestao = async (questaoId: string) => {
    try {
      await addQuestaoMutation.mutateAsync({ 
        avaliacaoId, 
        questaoId 
      })
      toast.success("Questão adicionada com sucesso!")
    } catch (error) {
      toast.error("Erro ao adicionar questão")
    }
  }

  const handleRemoveQuestao = async (questaoId: string) => {
    try {
      await removeQuestaoMutation.mutateAsync({ 
        avaliacaoId, 
        questaoId 
      })
      toast.success("Questão removida com sucesso!")
    } catch (error) {
      toast.error("Erro ao remover questão")
    }
  }

  // Gerar título para exibição
  const getDisplayTitle = () => {
    if (!avaliacao) return 'Carregando...'
    
    const disciplinaNome = typeof avaliacao.disciplina === 'object' 
      ? (avaliacao.disciplina as any).nome 
      : 'Disciplina'
    
    return `${avaliacao.tipo === TipoAvaliacao.EXAME ? 'Exame' : 'AP'} de ${disciplinaNome} - ${avaliacao.ano}`
  }

  // Determinar qual conjunto de questões exibir com base na aba ativa
  const currentQuestoes = activeTab === "associadas" ? questoesAssociadas : questoesDisponiveis
  const isLoadingQuestoes = activeTab === "associadas" ? isLoadingQuestoesAssociadas : isLoadingQuestoesDisponiveis
  const currentPagination = activeTab === "associadas" ? paginationAssociadas : paginationDisponiveis

  return (
    <DashboardLayout>
      {/* Cabeçalho com título e botões de ação */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="default" asChild className="mr-4">
            <Link href={`/dashboard/avaliacoes/${avaliacaoId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {isLoadingAvaliacao ? 'Carregando...' : `Questões - ${getDisplayTitle()}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/questoes/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova Questão
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs para alternar entre questões associadas e disponíveis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="associadas">Questões Associadas</TabsTrigger>
          <TabsTrigger value="disponiveis">Adicionar Questões</TabsTrigger>
        </TabsList>
        
        {/* Tab de Questões Associadas */}
        <TabsContent value="associadas" className="space-y-4">
          {isLoadingQuestoesAssociadas ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : questoesAssociadas.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <h3 className="text-lg font-medium">Nenhuma questão associada</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Esta avaliação ainda não possui questões associadas.
              </p>
              <Button onClick={() => setActiveTab("disponiveis")}>
                Adicionar Questões
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {questoesAssociadas.map((questao: Questao) => (
                  <QuestaoCard 
                    key={questao._id} 
                    questao={questao} 
                    isAssociated={true}
                    onRemoveFromAvaliacao={handleRemoveQuestao}
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <ItemsPerPage
                  value={itemsPerPage}
                  onChange={(value) => {
                    setItemsPerPage(value);
                    setCurrentPage(1);
                  }}
                />
                
                <Pagination
                  currentPage={currentPage}
                  totalPages={paginationAssociadas?.totalPages || 1}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </TabsContent>
        
        {/* Tab de Questões Disponíveis */}
        <TabsContent value="disponiveis" className="space-y-4">
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar questões..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          {isLoadingQuestoesDisponiveis ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : questoesDisponiveis.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <h3 className="text-lg font-medium">Nenhuma questão encontrada</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Não há questões disponíveis para adicionar ou sua busca não retornou resultados.
              </p>
              <Button asChild>
                <Link href="/dashboard/questoes/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Nova Questão
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {questoesDisponiveis.map((questao: Questao) => (
                  <QuestaoCard 
                    key={questao._id} 
                    questao={questao}
                    onAddToAvaliacao={handleAddQuestao}
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <ItemsPerPage
                  value={itemsPerPage}
                  onChange={(value) => {
                    setItemsPerPage(value);
                    setCurrentPage(1);
                  }}
                />
                
                <Pagination
                  currentPage={currentPage}
                  totalPages={paginationDisponiveis?.totalPages || 1}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}