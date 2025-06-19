"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Eye, Loader2, Pencil, Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ItemsPerPage } from '@/components/ui/items-per-page'
import { Pagination } from '@/components/ui/pagination'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { TipoAvaliacao } from '@/types/avaliacao'
import { Questao, QuestaoForm as QuestaoFormType } from '@/types/questao'
import { toast } from 'sonner'
import { QuestaoForm } from '@/components/questoes/questao-form'
import { QuestaoCard } from '@/components/questoes/questao-card'
import { useAvaliacao } from '@/hooks/use-avaliacoes'
import { 
  useQuestoes,
  useCreateQuestao, 
  useUpdateQuestao, 
  useDeleteQuestao 
} from '@/hooks/use-questoes'

export default function AvaliacaoQuestoesPage() {
  const params = useParams()
  const router = useRouter()
  const avaliacaoId = params.id as string
  
  // Estado para paginação e busca
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Estado para controlar edição de questão
  const [questaoEmEdicao, setQuestaoEmEdicao] = useState<Questao | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  
  // Carregar dados da avaliação
  const { avaliacao, isLoading: isLoadingAvaliacao } = useAvaliacao(avaliacaoId)
  
  // Hooks de gerenciamento de questões
  const { 
    questoes, 
    isLoading: isLoadingQuestoes,
    pagination,
    refetch
  } = useQuestoes({
    avaliacaoId,
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery
  })

  // Hooks de mutação
  const createQuestaoMutation = useCreateQuestao()
  const updateQuestaoMutation = useUpdateQuestao()
  const deleteQuestaoMutation = useDeleteQuestao()

  // Handler para criar questão
  const handleCreateQuestao = async (data: QuestaoFormType) => {
    try {
      console.log("Dados originais:", data);

      // Limpar dados para criação - remover campos sensíveis
      const { 
        imagemEnunciadoUrl, // URLs de imagem serão adicionadas por upload separado
        ...createData 
      } = data;

      // Garantir que as alternativas não têm imagemUrl
      const alternativas = createData.alternativas?.map(alt => {
        const { imagemUrl, ...altData } = alt;
        return altData;
      });

      // Construir objeto limpo para criação
      const cleanCreateData = {
        ...createData,
        alternativas,
        avaliacao: avaliacaoId, // Garantir que está usando o ID correto
        numero: Number(createData.numero), // Garantir que é número
        valor: Number(createData.valor) // Garantir que é número
      };

      console.log("Dados limpos para criação:", cleanCreateData);
      
      await createQuestaoMutation.mutateAsync(cleanCreateData);
      
      toast.success("Questão criada com sucesso!");
      refetch();
      return Promise.resolve();
    } catch (error: any) {
      // Extrair código de erro específico
      let errorCode = error.response?.data?.code || '';
      let errorMessage = "Ocorreu um erro";
      
      switch(errorCode) {
        case 'DUPLICATE_RESOURCE':
          errorMessage = "Já existe uma questão com este número na avaliação. Por favor, escolha outro número.";
          break;
        case 'RELATED_RESOURCE_NOT_FOUND':
          errorMessage = "A avaliação associada não foi encontrada.";
          break;
        case 'VALIDATION_ERROR':
          errorMessage = error.response?.data?.message || "Os dados fornecidos não são válidos.";
          break;
        default:
          errorMessage = error.message || "Erro ao criar questão";
      }
      
      toast.error(errorMessage);
      return Promise.reject(error);
    }
  }

  // Handler para abrir formulário de edição
  const handleOpenEditForm = (questao: Questao) => {
    setQuestaoEmEdicao(questao)
    setIsEditFormOpen(true)
  }

  // Handler para atualizar questão
  const handleUpdateQuestao = async (questaoId: string, data: QuestaoFormType) => {
    try {
      // Limpar dados para atualização - remover campos sensíveis
      const { 
        avaliacao, // Remover avaliação para não tentar mover a questão
        imagemEnunciadoUrl, // Remover URLs de imagem que são protegidas
        ...updateData 
      } = data;

      // Garantir que as alternativas não têm imagemUrl
      const alternativas = updateData.alternativas?.map(alt => {
        const { imagemUrl, ...altData } = alt;
        return altData;
      });

      // Construir objeto limpo para atualização
      const cleanUpdateData = {
        ...updateData,
        alternativas
      };

      console.log("Dados limpos para atualização:", cleanUpdateData);
      
      await updateQuestaoMutation.mutateAsync({
        id: questaoId,
        data: cleanUpdateData
      });
      
      toast.success("Questão atualizada com sucesso!");
      setIsEditFormOpen(false);
      setQuestaoEmEdicao(null);
      refetch();
      return Promise.resolve()
    } catch (error: any) {
      // Extrair código de erro específico
      let errorCode = error.response?.data?.code || '';
      let errorMessage = "Ocorreu um erro";
      
      switch(errorCode) {
        case 'DUPLICATE_RESOURCE':
          errorMessage = "Já existe uma questão com este número na avaliação";
          break;
        case 'VALIDATION_ERROR':
          errorMessage = error.response?.data?.message || "Erro de validação";
          break;
        case 'RELATED_RESOURCE_NOT_FOUND':
          errorMessage = "Avaliação não encontrada";
          break;
        default:
          errorMessage = error.message || "Erro ao atualizar questão";
      }
      
      toast.error(errorMessage);
      return Promise.reject(error);
    }
  }

  // Handler para excluir questão
  const handleDeleteQuestao = async (questaoId: string) => {
    if (confirm('Tem certeza que deseja excluir esta questão?')) {
      try {
        await deleteQuestaoMutation.mutateAsync(questaoId)
        toast.success("Questão excluída com sucesso!")
        refetch()
      } catch (error: any) {
        toast.error(`Erro ao excluir questão: ${error.message || "Ocorreu um erro"}`)
      }
    }
  }

  // Gerar título para exibição com trimestre/época
  const getDisplayTitle = () => {
    if (!avaliacao) return 'Carregando...'
    
    const disciplinaNome = typeof avaliacao.disciplina === 'object' 
      ? (avaliacao.disciplina as any).nome 
      : 'Disciplina'
    
    // Extrair informação de trimestre/época
    const trimestre = avaliacao.trimestre ? 
      `${avaliacao.trimestre} Trimestre` : '';
    
    const epoca = avaliacao.epoca || '';
    
    // Escolher qual informação de período mostrar (trimestre ou época)
    const periodo = trimestre || epoca || '';

    const provinciaNome = typeof avaliacao.provincia === 'object' ?
      (avaliacao.provincia as any).nome : '';
    // Montar o título com todas as informações
    return `${avaliacao.tipo === TipoAvaliacao.EXAME ? 'Exame' : 'AP'} ${periodo ? `(${periodo})` : ''} de ${disciplinaNome} - ${avaliacao.ano} ${provinciaNome}`;
  }

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
          <QuestaoForm
            avaliacaoId={avaliacaoId}
            onSubmit={handleCreateQuestao}
            title="Nova Questão"
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Questão
              </Button>
            }
          />
        </div>
      </div>

      {/* Barra de pesquisa */}
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

      {/* Lista de questões */}
      {isLoadingQuestoes ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : questoes.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <h3 className="text-lg font-medium">Nenhuma questão encontrada</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            {searchQuery ? 'Sua busca não retornou resultados.' : 'Esta avaliação ainda não possui questões.'}
          </p>
          <QuestaoForm
            avaliacaoId={avaliacaoId}
            onSubmit={handleCreateQuestao}
            title="Nova Questão"
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeira Questão
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questoes.map((questao: Questao) => (
              <QuestaoCard 
                key={questao._id} 
                questao={questao}
                showActions={true}
                actionMode="edit"
                onEdit={() => handleOpenEditForm(questao)}
                onDelete={() => handleDeleteQuestao(questao._id)}
                expandedByDefault={false}
              />
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <ItemsPerPage
              value={itemsPerPage}
              onChange={(value) => {
                setItemsPerPage(value);
                setCurrentPage(1);
              }}
            />
            
            <Pagination
              currentPage={currentPage}
              totalPages={pagination?.totalPages || 1}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
      
      {/* Formulário de edição (renderizado fora da estrutura principal) */}
      {questaoEmEdicao && (
        <QuestaoForm
          avaliacaoId={avaliacaoId}
          questao={questaoEmEdicao}
          isEditing={true}
          title="Editar Questão"
          onSubmit={(data) => handleUpdateQuestao(questaoEmEdicao._id, data)}
          isOpen={isEditFormOpen}
          onOpenChange={setIsEditFormOpen}
        />
      )}
    </DashboardLayout>
  )
}