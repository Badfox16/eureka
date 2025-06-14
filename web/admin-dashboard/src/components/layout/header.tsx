import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Bell, Search, UserCircle } from "lucide-react"

export default function Header() {
  return (
    <header className="h-16 flex items-center px-6 border-b bg-card">
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="pl-10 pr-4 py-2 w-full rounded-md border bg-background"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <Button variant="outline" size="default">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Nome - Cargo</span>
          <UserCircle className="h-8 w-8" />
        </div>
      </div>
    </header>
  )
}