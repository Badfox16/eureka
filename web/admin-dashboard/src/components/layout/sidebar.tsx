import Link from "next/link"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  ClipboardList, 
  User, 
  Settings 
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("w-64 bg-card border-r h-screen flex-shrink-0", className)}>
      <div className="h-16 flex items-center px-6 border-b">
        <h1 className="text-xl font-bold">Eureka</h1>
      </div>
      <nav className="px-4 py-6 space-y-1">
        <NavItem href="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
        <NavItem href="/dashboard/disciplinas" icon={BookOpen}>Disciplinas</NavItem>
        <NavItem href="/dashboard/provincias" icon={GraduationCap}>Províncias</NavItem>
        <NavItem href="/dashboard/avaliacoes" icon={ClipboardList}>Avaliações</NavItem>
        <NavItem href="/dashboard/usuarios" icon={User}>Usuários</NavItem>
        <NavItem href="/dashboard/configuracoes" icon={Settings}>Configurações</NavItem>
      </nav>
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}

function NavItem({ href, icon: Icon, children }: NavItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span>{children}</span>
    </Link>
  )
}