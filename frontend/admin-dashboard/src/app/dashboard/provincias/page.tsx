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

export default function ProvinciasPage() {
  // Dados de exemplo que seriam carregados do backend
  const provincias = [
    { id: 1, nome: "Luanda", codigo: "LDA", regiao: "Norte" },
    { id: 2, nome: "Benguela", codigo: "BG", regiao: "Centro" },
    { id: 3, nome: "Huambo", codigo: "HB", regiao: "Centro" },
    { id: 4, nome: "Malanje", codigo: "MLA", regiao: "Norte" },
    { id: 5, nome: "Namibe", codigo: "NMB", regiao: "Sul" },
  ]

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Províncias</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Província
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Código</TableHead>
              <TableHead className="hidden md:table-cell">Região</TableHead>
              <TableHead className="w-24 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {provincias.map((provincia) => (
              <TableRow key={provincia.id}>
                <TableCell className="font-medium">{provincia.nome}</TableCell>
                <TableCell>{provincia.codigo}</TableCell>
                <TableCell className="hidden md:table-cell">{provincia.regiao}</TableCell>
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