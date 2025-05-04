import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DisciplinasPage() {
  // Esta seria idealmente uma lista dinâmica carregada do backend
  const disciplinas = [
    { id: 1, codigo: "MAT", nome: "Matemática", descricao: "Estudo de números, quantidades, formas, estruturas e suas relações." },
    { id: 2, codigo: "FIS", nome: "Física", descricao: "Ciência que estuda as propriedades da matéria, energia, espaço e tempo." },
    { id: 3, codigo: "QUI", nome: "Química", descricao: "Estudo da composição, estrutura, propriedades e transformações da matéria." },
    { id: 4, codigo: "BIO", nome: "Biologia", descricao: "Ciência que estuda os seres vivos e suas interações com o meio ambiente." },
    { id: 5, codigo: "HIS", nome: "História", descricao: "Estudo sistemático do passado humano, suas sociedades e civilizações." }
  ]

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Disciplinas</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Disciplina
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Descrição</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disciplinas.map((disciplina) => (
              <TableRow key={disciplina.id}>
                <TableCell className="font-medium">{disciplina.codigo}</TableCell>
                <TableCell>{disciplina.nome}</TableCell>
                <TableCell className="hidden md:table-cell">{disciplina.descricao}</TableCell>
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