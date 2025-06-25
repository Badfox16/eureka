"use client"

import { useState } from "react"
import { Questao, QuestaoForm as QuestaoFormData } from "@/types/questao"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, ChevronUp, Trash, Edit, Eye, EyeOff } from "lucide-react"
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
import Image from 'next/image'

interface QuestaoCardProps {
  questao: Questao
  onEdit?: (questao: Questao) => React.ReactNode | void
  onView?: () => React.ReactNode | void
  onDelete?: (questaoId: string) => void
  showActions?: boolean
  actionMode?: "view" | "edit"
  expandedByDefault?: boolean
}

export function QuestaoCard({
  questao,
  onEdit,
  onView,
  onDelete,
  showActions = true,
  actionMode = "view",
  expandedByDefault = false
}: QuestaoCardProps) {
  const [expanded, setExpanded] = useState(expandedByDefault)
  const alternativaCorreta = questao.alternativas.find(alt => alt.correta)

  // Formatação do enunciado para exibir imagens incorporadas
  const formattedEnunciado = questao.enunciado.replace(/!\[.*?\]\((.*?)\)/g, '')
  
  // Determina qual botão de ação mostrar
  const renderActionButtons = () => {
    if (!showActions) return null
    
    return (
      <div className="flex space-x-2">
        {onEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(questao)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Editar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar questão</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{expanded ? "Menos detalhes" : "Ver detalhes"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{expanded ? "Ocultar detalhes" : "Ver detalhes completos"}</p>
          </TooltipContent>
        </Tooltip>

        {onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(questao._id)}
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
        )}
      </div>
    )
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
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">
              Questão {questao.numero}
              {questao.valor > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {questao.valor.toFixed(1)} ponto{questao.valor !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </div>
          {renderActionButtons()}
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
              className="ml-2 h-8 w-8 p-0 flex-shrink-0 md:hidden"
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
            <div className="relative mt-2 rounded-md overflow-hidden border h-40">
              <Image 
                src={buildImageUrl(questao.imagemEnunciadoUrl)} 
                alt="Imagem do enunciado" 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain"
                priority={false}
              />
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Conteúdo expandido com alternativas e explicação */}
      {expanded && (
        <>
          <CardContent className="pt-0 border-t">
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
                        <div className="mt-1 relative h-20">
                          <Image 
                            src={buildImageUrl(alternativa.imagemUrl)} 
                            alt={`Imagem alternativa ${alternativa.letra}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-contain" 
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
        </div>
      </CardFooter>
    </Card>
  )
}