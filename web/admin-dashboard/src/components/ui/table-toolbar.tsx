import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface Filter {
  id: string
  label: string
  value: string
  options?: { value: string; label: string }[]
}

interface TableToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filters: Filter[]
  activeFilters: Record<string, string>
  onFilterChange: (filterId: string, value: string) => void
  onFilterClear: (filterId: string) => void
  itemsTotal: number
  itemsFiltered: number
  showClearButton?: boolean // Nova propriedade opcional
}

export function TableToolbar({
  searchQuery,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  onFilterClear,
  itemsTotal,
  itemsFiltered,
  showClearButton = true // Valor padrão é true para compatibilidade
}: TableToolbarProps) {
  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <div className="flex flex-col space-y-4 py-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text" // Mudamos de "search" para "text" para evitar o X nativo do navegador
              placeholder="Pesquisar..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {showClearButton && searchQuery && (
              <Button
                variant="ghost"
                size="default"
                className="absolute right-0 top-0 h-full"
                onClick={() => onSearchChange("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-10">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <Badge className="ml-2" variant="secondary">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Filtrar por</h4>
                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{filter.label}</p>
                      {activeFilters[filter.id] && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-muted-foreground"
                          onClick={() => onFilterClear(filter.id)}
                        >
                          Limpar
                        </Button>
                      )}
                    </div>
                    {filter.options ? (
                      <Select
                        value={activeFilters[filter.id] || ""}
                        onValueChange={(value) => onFilterChange(filter.id, value)}
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {filter.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder={`Filtrar por ${filter.label.toLowerCase()}`}
                        value={activeFilters[filter.id] || ""}
                        onChange={(e) => onFilterChange(filter.id, e.target.value)}
                        className="h-8"
                      />
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {itemsFiltered === itemsTotal
            ? `Mostrando ${itemsTotal} ${itemsTotal === 1 ? "item" : "itens"}`
            : `Mostrando ${itemsFiltered} de ${itemsTotal} ${itemsTotal === 1 ? "item" : "itens"}`}
        </div>
      </div>
      
      {/* Exibir filtros ativos */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([filterId, value]) => {
            const filter = filters.find((f) => f.id === filterId)
            if (!filter || !value) return null
            
            const label = filter.options?.find((o) => o.value === value)?.label || value
            
            return (
              <Badge key={filterId} variant="secondary" className="px-3 py-1">
                <span className="font-medium mr-1">{filter.label}:</span> {label}
                <Button
                  variant="ghost"
                  size="default"
                  className="ml-1 h-4 w-4 p-0"
                  onClick={() => onFilterClear(filterId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
          
          {activeFilterCount > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => {
                Object.keys(activeFilters).forEach((filterId) => {
                  onFilterClear(filterId)
                })
              }}
            >
              Limpar todos
            </Button>
          )}
        </div>
      )}
    </div>
  )
}