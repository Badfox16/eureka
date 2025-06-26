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
import { QuestaoForm } from '@/components/questoes/questao-form'
import { QuestaoCard } from '@/components/questoes/questao-card'
import { useAvaliacao } from '@/hooks/use-avaliacoes'
import { 
  useQuestoes,
  useCreateQuestao, 
  useUpdateQuestao, 
  useDeleteQuestao,
  useAssociarImagemTemporaria
} from '@/hooks/use-questoes'
import { handleApiError, showSuccessToast, showWarningToast } from '@/lib/error-utils'
import { te } from 'date-fns/locale'

export default function AvaliacaoQuestoesPage() {
  const params = useParams()
  const router = useRouter()
  const avaliacaoId = params.id as string
  
  // Estado para paginação e busca
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Estado para controlar edição de questão
  const [questaoEmEdicao, setQuestaoEmEdicao] = useState<Questao | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  
  const { avaliacao, isLoading: isLoadingAvaliacao } = useAvaliacao(avaliacaoId)
  
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
  const associarImagemMutation = useAssociarImagemTemporaria()

  const processarImagens = async (questaoId: string, data: QuestaoFormType) => {
    let errosImagem = false;
    const tempImagemEnunciadoUrl = data.imagemEnunciadoUrl;
    const tempAlternativasImagensUrls = data.alternativas
      .map((alt, idx) => ({
        letra: alt.letra || String.fromCharCode(65 + idx),
        imagemUrl: alt.imagemUrl
      }))
      .filter(alt => alt.imagemUrl && alt.imagemUrl.includes('/uploads/imagem-'));

    if (tempImagemEnunciadoUrl && tempImagemEnunciadoUrl.includes('/uploads/imagem-')) {
      try {
        await associarImagemMutation.mutateAsync({
          questaoId,
          imagemTemporariaUrl: tempImagemEnunciadoUrl,
          tipo: 'enunciado'
        });
      } catch (error) {
        errosImagem = true;
        handleApiError(error, 'Associar Imagem Enunciado');
      }
    }

    for (const alt of tempAlternativasImagensUrls) {
      try {
        await associarImagemMutation.mutateAsync({
          questaoId,
          imagemTemporariaUrl: alt.imagemUrl!,
          tipo: 'alternativa',
          letra: alt.letra
        });
      } catch (error) {
        errosImagem = true;
        handleApiError(error, `Associar Imagem Alternativa ${alt.letra}`);
      }
    }
    return errosImagem;
  }

  const handleCreateQuestao = async (data: QuestaoFormType) => {
    try {
      const { imagemEnunciadoUrl, ...createData } = data;
      const alternativas = createData.alternativas?.map(({ imagemUrl, ...alt }) => alt);
      const cleanCreateData = {
        ...createData,
        alternativas,
        avaliacao: avaliacaoId,
        numero: Number(createData.numero),
        valor: Number(createData.valor)
      };

      const response = await createQuestaoMutation.mutateAsync(cleanCreateData);
      const questaoId = response.data._id;
      
      const errosImagem = await processarImagens(questaoId, data);
      
      if (errosImagem) {
        showWarningToast("Questão criada, mas houve erro ao associar uma ou mais imagens.");
      } else {
        showSuccessToast("Questão criada com sucesso!");
      }
      
      refetch();
      return Promise.resolve();
    } catch (error) {
      handleApiError(error, 'Criar Questão');
      return Promise.reject(error);
    }
  }

  const handleUpdateQuestao = async (questaoId: string, data: QuestaoFormType) => {
    try {
      const { avaliacao, imagemEnunciadoUrl, ...updateData } = data;
      const alternativas = updateData.alternativas?.map(({ imagemUrl, ...alt }) => alt);
      const cleanUpdateData = { ...updateData, alternativas };

      await updateQuestaoMutation.mutateAsync({ id: questaoId, data: cleanUpdateData });
      
      const errosImagem = await processarImagens(questaoId, data);
      
      if (errosImagem) {
        showWarningToast("Questão atualizada, mas houve erro ao associar uma ou mais imagens.");
      } else {
        showSuccessToast("Questão atualizada com sucesso!");
      }
      
      setIsEditFormOpen(false);
      refetch();
      return Promise.resolve();
    } catch (error) {
      handleApiError(error, 'Atualizar Questão');
      return Promise.reject(error);
    }
  }

  const handleDeleteQuestao = async (questaoId: string) => {
    try {
      await deleteQuestaoMutation.mutateAsync(questaoId)
      // O hook já mostra o toast de sucesso
    } catch (error: any) {
      handleApiError(error, 'Excluir Questão');
    }
  }

  const handleOpenEditForm = (questao: Questao) => {
    setQuestaoEmEdicao(questao)
    setIsEditFormOpen(true)
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

    const epoca = avaliacao.epoca ? `${avaliacao.epoca} Época` : '';

    // Escolher qual informação de período mostrar (trimestre ou época)
    const periodo = trimestre || epoca || '';

    const provinciaNome = typeof avaliacao.provincia === 'object' ?
      (avaliacao.provincia as any).nome : '';
    // Montar o título com todas as informações
    return `${avaliacao.tipo === TipoAvaliacao.EXAME ? 'Exame' : 'AP'} ${periodo ? `(${periodo})` : ''} de ${disciplinaNome} - ${avaliacao.ano} ${provinciaNome}`;
  }
    const API_BASE_URL = process.env.UPLOADS_BASE_URL || 'http://localhost:3001';

  // Função utilitária para construir URLs de imagem corretamente
  const buildImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Garantir que não há barras duplicadas
    const basePath = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const imagePath = path.startsWith('/') ? path : `/${path}`;
    
    return `${basePath}${imagePath}`;
  };

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