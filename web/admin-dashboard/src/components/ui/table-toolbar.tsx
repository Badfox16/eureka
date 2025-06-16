import React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
            <Button
              variant="ghost"
              size="default"
              className="absolute right-0 top-0 h-10 w-10"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpar busca</span>
            </Button>
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
                  <Button
                    variant="ghost"
                    size="default"
                    className="absolute right-0 top-0 h-10 w-10"
                    onClick={() => {
                      // Este é o ponto chave da correção:
                      // Chamar onFilterClear quando o X for clicado
                      onFilterClear(filter.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Limpar filtro</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {(itemsTotal !== undefined || itemsFiltered !== undefined) && (
        <div className="text-sm text-muted-foreground">
          {itemsFiltered !== undefined && itemsTotal !== undefined && itemsFiltered < itemsTotal ? (
            <>
              Mostrando <strong>{itemsFiltered}</strong> de <strong>{itemsTotal}</strong> itens
            </>
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