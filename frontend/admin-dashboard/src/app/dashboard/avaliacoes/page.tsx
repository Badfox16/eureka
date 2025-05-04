// src/app/dashboard/avaliacoes/page.tsx
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

export default function AvaliacoesPage() {
  // Dados de exemplo que seriam carregados do backend
  const avaliacoes = [
    { 
      id: 1, 
      titulo: "Exame Nacional de Matemática", 
      disciplina: "Matemática", 
      ano: 2024, 
      tipo: "Exame Nacional", 
      classe: 12, 
      epoca: "1ª Época" 
    },
    { 
      id: 2, 
      titulo: "Avaliação Provincial de Física", 
      disciplina: "Física", 
      ano: 2024, 
      tipo: "Avaliação Provincial", 
      classe: 12, 
      provincia: "Luanda",
      trimestre: "2º Trimestre" 
    },
    { 
      id: 3, 
      titulo: "Exame Nacional de Química", 
      disciplina: "Química", 
      ano: 2023, 
      tipo: "Exame Nacional", 
      classe: 12, 
      epoca: "2ª Época" 
    },
    { 
      id: 4, 
      titulo: "Avaliação Provincial de História", 
      disciplina: "História", 
      ano: 2024, 
      tipo: "Avaliação Provincial", 
      classe: 11, 
      provincia: "Benguela",
      trimestre: "1º Trimestre" 
    },
    { 
      id: 5, 
      titulo: "Exame Nacional de Biologia", 
      disciplina: "Biologia", 
      ano: 2023, 
      tipo: "Exame Nacional", 
      classe: 12,
      epoca: "1ª Época" 
    },
  ]

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Avaliação
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Disciplina</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Classe</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {avaliacoes.map((avaliacao) => (
              <TableRow key={avaliacao.id}>
                <TableCell className="font-medium">{avaliacao.titulo}</TableCell>
                <TableCell>{avaliacao.disciplina}</TableCell>
                <TableCell>{avaliacao.ano}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={avaliacao.tipo === "Exame Nacional" ? "default" : "outline"}>
                    {avaliacao.tipo}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{avaliacao.classe}ª</TableCell>
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