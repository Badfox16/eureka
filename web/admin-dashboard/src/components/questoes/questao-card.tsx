"use client"

import { useState } from "react"
import { Questao, Alternativa } from "@/types/questao"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, ChevronUp, Trash, Edit, Eye, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger 
} from "@/components/ui/tooltip"

interface QuestaoCardProps {
  questao: Questao
  onEdit?: (questao: Questao) => void
  onDelete?: (questaoId: string) => void
  onAddToAvaliacao?: (questaoId: string) => void
  onRemoveFromAvaliacao?: (questaoId: string) => void
  showActions?: boolean
  actionMode?: "add" | "remove" | "view" | "edit"
  expandedByDefault?: boolean
}

export function QuestaoCard({
  questao,
  onEdit,
  onDelete,
  onAddToAvaliacao,
  onRemoveFromAvaliacao,
  showActions = true,
  actionMode = "view",
  expandedByDefault = false
}: QuestaoCardProps) {
  const [expanded, setExpanded] = useState(expandedByDefault)
  const alternativaCorreta = questao.alternativas.find(alt => alt.correta)

  // Formatação do enunciado para exibir imagens incorporadas
  const formattedEnunciado = questao.enunciado.replace(/!\[.*?\]\((.*?)\)/g, '')
  
  // Determina qual botão de ação mostrar
  const renderActionButton = () => {
    if (!showActions) return null
    
    switch (actionMode) {
      case "add":
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onAddToAvaliacao?.(questao._id)}
            className="ml-auto"
          >
            <Check className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        )
      case "remove":
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onRemoveFromAvaliacao?.(questao._id)}
            className="ml-auto text-destructive hover:bg-destructive/10"
          >
            <Trash className="mr-2 h-4 w-4" />
            Remover
          </Button>
        )
      case "edit":
        return (
          <div className="flex space-x-2 ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit?.(questao)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar questão</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDelete?.(questao._id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir questão</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              Questão {questao.numero}
              {questao.valor > 0 && (
                <Badge variant="outline" className="ml-2">
                  {questao.valor.toFixed(1)} ponto{questao.valor !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            
            {questao.avaliacao && typeof questao.avaliacao !== 'string' && (
              <CardDescription>
                {questao.avaliacao.titulo} ({questao.avaliacao.ano}) - {questao.avaliacao.disciplina.nome}
              </CardDescription>
            )}
          </div>
          
          {renderActionButton()}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: formattedEnunciado }} />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-8 w-8 p-0 flex-shrink-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">
                {expanded ? "Recolher" : "Expandir"}
              </span>
            </Button>
          </div>
          
          {questao.imagemEnunciadoUrl && (
            <div className="relative mt-2 rounded-md overflow-hidden">
              <img 
                src={questao.imagemEnunciadoUrl} 
                alt="Imagem do enunciado" 
                className="max-h-40 object-contain mx-auto"
              />
            </div>
          )}
        </div>
      </CardContent>
      
      {expanded && (
        <>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Alternativas:</h4>
              
              <ul className="space-y-2">
                {questao.alternativas.map((alternativa) => (
                  <li 
                    key={alternativa.letra} 
                    className={cn(
                      "flex p-2 rounded-md",
                      alternativa.correta && "bg-primary/10"
                    )}
                  >
                    <div className="mr-2 font-bold">{alternativa.letra})</div>
                    <div className="flex-1">
                      <div dangerouslySetInnerHTML={{ __html: alternativa.texto }} />
                      {alternativa.imagemUrl && (
                        <div className="mt-1">
                          <img 
                            src={alternativa.imagemUrl} 
                            alt={`Imagem alternativa ${alternativa.letra}`} 
                            className="max-h-20 object-contain"
                          />
                        </div>
                      )}
                    </div>
                    {alternativa.correta && (
                      <Badge className="ml-2 self-start" variant="secondary">
                        <Check className="mr-1 h-3 w-3" />
                        Correta
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
              
              {questao.explicacao && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <h4 className="text-sm font-medium mb-1">Explicação:</h4>
                  <div className="text-sm" dangerouslySetInnerHTML={{ __html: questao.explicacao }} />
                </div>
              )}
            </div>
          </CardContent>
        </>
      )}
      
      <CardFooter className="pt-1 text-xs text-muted-foreground">
        <div className="flex items-center">
          {alternativaCorreta && (
            <span className="mr-3">
              Resposta: <strong>{alternativaCorreta.letra}</strong>
            </span>
          )}
          <span>
            ID: {questao._id.substring(0, 8)}...
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}