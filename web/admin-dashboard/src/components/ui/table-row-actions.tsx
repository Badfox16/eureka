import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface TableRowActionsProps {
  editTrigger?: React.ReactNode;
  viewTrigger?: React.ReactNode;
  deleteTrigger?: React.ReactNode;
  customTriggers?: React.ReactNode[];
}

export function TableRowActions({
  editTrigger,
  viewTrigger,
  deleteTrigger,
  customTriggers,
}: TableRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {viewTrigger}
        {editTrigger}
        {customTriggers?.map((trigger, index) => (
          <React.Fragment key={index}>{trigger}</React.Fragment>
        ))}
        {deleteTrigger}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}