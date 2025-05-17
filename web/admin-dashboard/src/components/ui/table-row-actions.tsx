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
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewTrigger?: React.ReactNode;
  editTrigger?: React.ReactNode;
  deleteTrigger?: React.ReactNode;
}

export function TableRowActions({
  onView,
  onEdit,
  onDelete,
  viewTrigger,
  editTrigger,
  deleteTrigger,
}: TableRowActionsProps) {
  const hasView = onView || viewTrigger;
  const hasEdit = onEdit || editTrigger;
  const hasDelete = onDelete || deleteTrigger;

  // Função para criar item de menu com ou sem trigger
  const createMenuItem = (
    onClick?: () => void,
    trigger?: React.ReactNode,
    icon?: React.ReactNode,
    label?: string,
    className?: string
  ) => {
    if (trigger) {
      // Se há um trigger, retorna-o diretamente
      return trigger;
    } else if (onClick) {
      // Se há apenas um onClick, cria um MenuItem padrão
      return (
        <DropdownMenuItem onClick={onClick} className={className}>
          {icon}
          <span>{label}</span>
        </DropdownMenuItem>
      );
    }
    return null;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="default" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {hasView && createMenuItem(
          onView,
          viewTrigger,
          <Eye className="mr-2 h-4 w-4" />,
          "Visualizar"
        )}
        
        {hasEdit && createMenuItem(
          onEdit,
          editTrigger,
          <Edit className="mr-2 h-4 w-4" />,
          "Editar"
        )}
        
        {hasDelete && (
          <>
            {(hasView || hasEdit) && <DropdownMenuSeparator />}
            {createMenuItem(
              onDelete,
              deleteTrigger,
              <Trash className="mr-2 h-4 w-4" />,
              "Excluir",
              "text-destructive hover:bg-destructive hover:text-white focus:bg-destructive focus:text-white"
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}