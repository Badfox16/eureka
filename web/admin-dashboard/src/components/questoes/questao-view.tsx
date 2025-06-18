"use client"

import { useState } from "react"
import { Questao } from "@/types/questao"
import { Check, X, Printer, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface QuestaoViewProps {
  questao: Questao
  onPrevious?: () => void
  onNext?: () => void
  trigger: React.ReactNode
  totalQuestoes?: number
  currentIndex?: number
}

export function QuestaoView({
  questao,
  onPrevious,
  onNext,
  trigger,
  totalQuestoes,
  currentIndex
}: QuestaoViewProps) {
  const [open, setOpen] = useState(false)

  const handlePrint = () => {
    // Abrir janela de impressão com conteúdo formatado
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Questão ${questao.numero}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { font-size: 18px; margin-bottom: 5px; }
              .alternativa { margin: 10px 0; }
              .correta { font-weight: bold; }
              .explicacao { margin-top: 20px; padding: 10px; background-color: #f5f5f5; }
            </style>
          </head>
          <body>
            <h1>Questão ${questao.numero}</h1>
            <div>${questao.enunciado}</div>
            ${questao.imagemEnunciadoUrl ? `<img src="${questao.imagemEnunciadoUrl}" style="max-width: 100%; margin: 10px 0;" />` : ''}
            <div>
              ${questao.alternativas.map(alt => `
                <div class="alternativa ${alt.correta ? 'correta' : ''}">
                  <strong>${alt.letra})</strong> ${alt.texto}
                  ${alt.imagemUrl ? `<img src="${alt.imagemUrl}" style="max-width: 100%; margin: 5px 0;" />` : ''}
                  ${alt.correta ? ' (CORRETA)' : ''}
                </div>
              `).join('')}
            </div>
            ${questao.explicacao ? `<div class="explicacao">
              <strong>Explicação:</strong> ${questao.explicacao}
            </div>` : ''}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              Questão {questao.numero}
              {totalQuestoes && currentIndex !== undefined && (
                <span className="text-muted-foreground ml-2 text-sm font-normal">
                  ({currentIndex + 1} de {totalQuestoes})
                </span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                <span className="sr-only">Imprimir</span>
              </Button>
              
              {onPrevious && (
                <Button variant="outline" size="sm" onClick={() => { onPrevious(); }}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Anterior</span>
                </Button>
              )}
              
              {onNext && (
                <Button variant="outline" size="sm" onClick={() => { onNext(); }}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Próxima</span>
                </Button>
              )}
            </div>
          </DialogTitle>
          
          <DialogDescription>
            {questao.avaliacao && typeof questao.avaliacao !== 'string' ? (
              <>
                {questao.avaliacao.titulo} ({questao.avaliacao.ano}) - {questao.avaliacao.disciplina.nome}
              </>
            ) : 'Detalhes da questão'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Enunciado</h3>
              <Badge variant="outline">
                {questao.valor.toFixed(1)} ponto{questao.valor !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: questao.enunciado }} />
            
            {questao.imagemEnunciadoUrl && (
              <div className="rounded-md overflow-hidden mt-2">
                <img 
                  src={questao.imagemEnunciadoUrl} 
                  alt="Imagem do enunciado" 
                  className="max-h-60 object-contain mx-auto"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Alternativas</h3>
            
            <div className="grid gap-3">
              {questao.alternativas.map((alternativa) => (
                <div 
                  key={alternativa.letra}
                  className={cn(
                    "flex items-start p-3 rounded-md border",
                    alternativa.correta ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className="mr-3 flex-shrink-0">
                    <div className={cn(
                      "w-6 h-6 flex items-center justify-center rounded-full",
                      alternativa.correta 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {alternativa.correta ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{alternativa.letra})</span>
                      <div className="prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: alternativa.texto }} />
                    </div>
                    
                    {alternativa.imagemUrl && (
                      <div className="mt-2">
                        <img 
                          src={alternativa.imagemUrl} 
                          alt={`Imagem alternativa ${alternativa.letra}`} 
                          className="max-h-40 object-contain rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  
                  {alternativa.correta && (
                    <Badge className="ml-2" variant="secondary">
                      Correta
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {questao.explicacao && (
            <div className="p-4 bg-muted rounded-md">
              <h3 className="text-sm font-medium mb-2">Explicação</h3>
              <div className="prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: questao.explicacao }} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}