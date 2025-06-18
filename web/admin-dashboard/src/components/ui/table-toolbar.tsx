import React from "react";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";

export interface FilterOption {
  value: string;
  label: string;
}

export interface Filter {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  icon?: React.ReactNode;
}

interface TableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters?: Filter[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (filterId: string, value: string) => void;
  onFilterClear?: (filterId: string) => void;
  showClearButton?: boolean;
  itemsTotal?: number;
  itemsFiltered?: number;
}

export function TableToolbar({
  searchQuery,
  onSearchChange,
  filters,
  activeFilters = {},
  onFilterChange = () => {},
  onFilterClear = () => {},
  showClearButton = false,
  itemsTotal,
  itemsFiltered,
}: TableToolbarProps) {
  // Determinar se há filtros ativos
  const hasActiveFilters = Object.values(activeFilters).some(value => !!value);
  
  // Verificar se estamos filtrando (exibindo menos itens do que o total)
  const isFiltering = typeof itemsTotal === 'number' && 
                      typeof itemsFiltered === 'number' && 
                      itemsTotal > itemsFiltered;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-2">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-8 w-full sm:w-[300px]"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {showClearButton && searchQuery && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="default"
                  className="absolute right-0 top-0 h-10 w-10"
                  onClick={() => onSearchChange("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Limpar busca</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limpar busca</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {filters && filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <div key={filter.id} className="relative">
                <Select
                  value={filter.value || undefined} // Usar undefined quando não tiver valor
                  onValueChange={(value) => {
                    if (value === "_all_") {
                      onFilterClear(filter.id);
                    } else {
                      onFilterChange(filter.id, value);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <div className="flex items-center">
                      {filter.icon && <div className="mr-2">{filter.icon}</div>}
                      <SelectValue placeholder={filter.label} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all_">Todos</SelectItem>
                    {filter.options.map((option) => (
                      <SelectItem
                        key={option.value || `_empty_${option.label}`}
                        value={option.value || `_empty_${option.label}`}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filter.value && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="default"
                        className="absolute right-0 top-0 h-10 w-10"
                        onClick={() => onFilterClear(filter.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Limpar filtro</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remover filtro {filter.label}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {(itemsTotal !== undefined || itemsFiltered !== undefined) && (
        <div className="text-sm text-muted-foreground">
          {isFiltering ? (
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Mostrando <strong className="mx-1">{itemsFiltered}</strong> de <strong className="mx-1">{itemsTotal}</strong> itens
              {hasActiveFilters && (
                <Badge variant="outline" className="ml-2">
                  Filtros ativos
                </Badge>
              )}
            </div>
          ) : itemsTotal !== undefined ? (
            <>
              Total: <strong>{itemsTotal}</strong> itens
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}