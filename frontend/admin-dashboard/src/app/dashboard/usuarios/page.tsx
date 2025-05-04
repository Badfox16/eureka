// src/app/dashboard/usuarios/page.tsx
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function UsuariosPage() {
  // Dados de exemplo que seriam carregados do backend
  const usuarios = [
    { 
      id: 1, 
      nome: "João Silva", 
      email: "joao.silva@exemplo.com", 
      tipo: "ADMIN", 
      status: "Ativo", 
      dataCriacao: "2024-01-15" 
    },
    { 
      id: 2, 
      nome: "Maria Oliveira", 
      email: "maria@exemplo.com", 
      tipo: "PROFESSOR", 
      status: "Ativo", 
      dataCriacao: "2024-02-20" 
    },
    { 
      id: 3, 
      nome: "Pedro Santos", 
      email: "pedro@exemplo.com", 
      tipo: "NORMAL", 
      status: "Inativo", 
      dataCriacao: "2024-03-10" 
    },
    { 
      id: 4, 
      nome: "Ana Pereira", 
      email: "ana@exemplo.com", 
      tipo: "PROFESSOR", 
      status: "Ativo", 
      dataCriacao: "2024-04-05" 
    },
    { 
      id: 5, 
      nome: "Carlos Ferreira", 
      email: "carlos@exemplo.com", 
      tipo: "NORMAL", 
      status: "Ativo", 
      dataCriacao: "2024-05-01" 
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium">{usuario.nome}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge 
                    variant={
                      usuario.tipo === "ADMIN" 
                        ? "destructive" 
                        : usuario.tipo === "PROFESSOR" 
                          ? "default" 
                          : "outline"
                    }
                  >
                    {usuario.tipo}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge 
                    variant={usuario.status === "Ativo" ? "success" : "secondary"}
                  >
                    {usuario.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  )
}