"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Edit, 
  Plus, 
  ArrowLeft,
  ListChecks
} from 'lucide-react'
import { useAvaliacao, useDeleteAvaliacao, useUpdateAvaliacao } from '@/hooks/use-avaliacoes'
import { useDisciplinas } from '@/hooks/use-disciplinas'
import { useProvincias } from '@/hooks/use-provincias'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AvaliacaoForm } from '@/components/avaliacoes/avaliacao-form'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { TipoAvaliacao, Trimestre, Epoca, VarianteProva, AreaEstudo } from '@/types/avaliacao'

export default function AvaliacaoDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  // Carregar dados da avaliação
  const { avaliacao, isLoading, error } = useAvaliacao(id)
  const { data: disciplinasData } = useDisciplinas()
  const { data: provinciasData } = useProvincias()

  // Mutations
  const updateAvaliacaoMutation = useUpdateAvaliacao()
  const deleteAvaliacaoMutation = useDeleteAvaliacao()

  const [isDeleting, setIsDeleting] = useState(false)

  // Manipuladores de eventos
  const handleUpdateAvaliacao = async (data: any) => {
    try {
      await updateAvaliacaoMutation.mutateAsync({ id, data })
      return true
    } catch (error) {
      return false
    }
  }

  const handleDeleteAvaliacao = async () => {
    try {
      setIsDeleting(true)
      await deleteAvaliacaoMutation.mutateAsync(id)
      router.push('/dashboard/avaliacoes')
    } catch (error) {
      setIsDeleting(false)
    }
  }

  // Funções auxiliares para renderização
  const getDisciplinaNome = () => {
    if (!avaliacao) return ''
    if (typeof avaliacao.disciplina === 'object' && avaliacao.disciplina) {
      return (avaliacao.disciplina as any).nome
    }
    
    const disciplina = disciplinasData?.data.find(d => d._id === avaliacao.disciplina)
    return disciplina ? disciplina.nome : 'Disciplina não encontrada'
  }

  const getProvinciaNome = () => {
    if (!avaliacao || !avaliacao.provincia) return null
    if (typeof avaliacao.provincia === 'object') {
      return (avaliacao.provincia as any).nome
    }
    
    const provincia = provinciasData?.data.find(p => p._id === avaliacao.provincia)
    return provincia ? provincia.nome : 'Província não encontrada'
  }

  // Gerar título para exibição
  const getDisplayTitle = () => {
    if (!avaliacao) return ''
    
    if (avaliacao.titulo) return avaliacao.titulo
    
    const disciplinaNome = getDisciplinaNome()
    return `${avaliacao.tipo === TipoAvaliacao.EXAME ? 'Exame' : 'AP'} de ${disciplinaNome} - ${avaliacao.ano} ${
      avaliacao.tipo === TipoAvaliacao.EXAME 
        ? `(${avaliacao.epoca} Época)`
        : `(${avaliacao.trimestre} Trimestre)`
    }`
  }

  // Exibir carregamento
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="default" asChild className="mr-4">
            <Link href="/dashboard/avaliacoes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Skeleton className="h-8 w-1/3" />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-1/4 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  // Exibir erro
  if (error || !avaliacao) {
    return (
      <DashboardLayout>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="default" asChild className="mr-4">
            <Link href="/dashboard/avaliacoes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Erro ao carregar avaliação</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Não foi possível carregar os detalhes da avaliação. Tente novamente.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/avaliacoes">Voltar para Avaliações</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Cabeçalho com título e ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="default" asChild className="mr-4">
            <Link href="/dashboard/avaliacoes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{getDisplayTitle()}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/avaliacoes/${id}/questoes`}>
              <ListChecks className="mr-2 h-4 w-4" />
              Gerenciar Questões
            </Link>
          </Button>
          <AvaliacaoForm
            avaliacao={avaliacao}
            onSubmit={handleUpdateAvaliacao}
            trigger={
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            }
          />
          <ConfirmDialog
            title="Excluir Avaliação"
            description={`Tem certeza que deseja excluir a avaliação "${getDisplayTitle()}"? Esta ação não pode ser desfeita.`}
            onConfirm={handleDeleteAvaliacao}
            trigger={
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card de Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Tipo
                </p>
                <p className="font-medium">
                  <Badge variant={avaliacao.tipo === TipoAvaliacao.EXAME ? 'default' : 'outline'}>
                    {avaliacao.tipo === TipoAvaliacao.EXAME ? 'Exame Nacional' : 'Avaliação Provincial'}
                  </Badge>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Ano
                </p>
                <p className="font-medium">{avaliacao.ano}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Classe
                </p>
                <p className="font-medium">{avaliacao.classe}ª</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Disciplina
                </p>
                <p className="font-medium">{getDisciplinaNome()}</p>
              </div>
            </div>

            {avaliacao.tipo === TipoAvaliacao.EXAME ? (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Época</p>
                <p className="font-medium">{avaliacao.epoca} Época</p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Trimestre</p>
                  <p className="font-medium">{avaliacao.trimestre} Trimestre</p>
                </div>
                {getProvinciaNome() && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Província</p>
                    <p className="font-medium">{getProvinciaNome()}</p>
                  </div>
                )}
              </>
            )}

            {avaliacao.variante && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Variante</p>
                <p className="font-medium">
                  {avaliacao.variante === VarianteProva.UNICA ? 'Única' : `Variante ${avaliacao.variante}`}
                </p>
              </div>
            )}

            {avaliacao.areaEstudo && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Área de Estudo</p>
                <p className="font-medium">
                  {avaliacao.areaEstudo === AreaEstudo.GERAL ? 'Geral' : 
                   avaliacao.areaEstudo === AreaEstudo.CIENCIAS ? 'Ciências' : 'Letras'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Questões */}
        <Card>
          <CardHeader>
            <CardTitle>Questões</CardTitle>
            <CardDescription>
              Gerencie as questões associadas a esta avaliação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <ListChecks className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Gerenciar Questões</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Adicione, edite ou remova questões desta avaliação para construir o banco de questões.
              </p>
              <Button asChild>
                <Link href={`/dashboard/avaliacoes/${id}/questoes`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Gerenciar Questões
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}