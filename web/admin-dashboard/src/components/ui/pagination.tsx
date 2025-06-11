import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Não renderiza paginação para apenas uma página
  if (totalPages <= 1) return null

  // Função para gerar array de números de página a mostrar
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5 // Número máximo de páginas a mostrar

    if (totalPages <= maxPagesToShow) {
      // Se houver menos páginas que o máximo, mostra todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Sempre mostra a primeira página
      pageNumbers.push(1)

      // Calcula o início da sequência de páginas
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Ajusta o número de páginas se estiver no início ou no fim
      if (startPage === 2) endPage = Math.min(totalPages - 1, startPage + 2)
      if (endPage === totalPages - 1) startPage = Math.max(2, endPage - 2)

      // Adiciona ellipsis se necessário
      if (startPage > 2) pageNumbers.push(-1) // -1 representa ellipsis

      // Adiciona páginas do meio
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Adiciona ellipsis se necessário
      if (endPage < totalPages - 1) pageNumbers.push(-1) // -1 representa ellipsis

      // Sempre mostra a última página
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="default"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Página anterior</span>
      </Button>
      
      {pageNumbers.map((page, index) => 
        page === -1 ? (
          <Button
            key={`ellipsis-${index}`}
            variant="ghost"
            disabled
            className="cursor-default"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        )
      )}
      
      <Button
        variant="outline"
        size="default"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Próxima página</span>
      </Button>
    </div>
  )
}