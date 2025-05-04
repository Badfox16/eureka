import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { Button } from "@/components/ui/button"
  import { Edit, MoreHorizontal, Trash, Eye } from "lucide-react"
  
  interface TableRowActionsProps {
    onView?: () => void
    onEdit?: () => void
    onDelete?: () => void
  }
  
  export function TableRowActions({
    onView,
    onEdit,
    onDelete,
  }: TableRowActionsProps) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onView && (
            <DropdownMenuItem onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Visualizar</span>
            </DropdownMenuItem>
          )}
          
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Editar</span>
            </DropdownMenuItem>
          )}
          
          {onDelete && (
            <>
              {(onView || onEdit) && <DropdownMenuSeparator />}
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-destructive hover:bg-destructive hover:text-white focus:bg-destructive focus:text-white"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Excluir</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }