// src/app/dashboard/page.tsx
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, FileText, GraduationCap } from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Disciplinas" 
          value="10" 
          icon={BookOpen} 
          description="Total de disciplinas" 
        />
        <StatCard 
          title="Províncias" 
          value="18" 
          icon={GraduationCap} 
          description="Total de províncias" 
        />
        <StatCard 
          title="Avaliações" 
          value="24" 
          icon={FileText} 
          description="Últimos 30 dias" 
        />
        <StatCard 
          title="Usuários" 
          value="156" 
          icon={Users} 
          description="Usuários registrados" 
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nenhuma atividade recente para mostrar.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Disciplinas Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Sem dados suficientes para mostrar estatísticas.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}