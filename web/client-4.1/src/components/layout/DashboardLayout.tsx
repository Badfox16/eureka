"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Book, 
  ChevronDown, 
  Home, 
  LogOut, 
  Menu, 
  User, 
  X 
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNotifications } from "@/hooks/useNotifications";
import { primary } from "@/lib/colors";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { usuario, logout } = useAuth();
  const { contadorNaoLidas } = useNotifications();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Verificar autenticação no carregamento da página
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.replace('/login');
        return;
      }
      setIsAuthChecking(false);
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { name: "Quizzes", path: "/dashboard/quizzes", icon: <Book className="w-5 h-5" /> },
    { name: "Perfil", path: "/dashboard/perfil", icon: <User className="w-5 h-5" /> },
    { name: "Notificações", path: "/dashboard/notificacoes", icon: <Bell className="w-5 h-5" />, badge: contadorNaoLidas },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">      {/* Header mobile */}      <header className="lg:hidden bg-white dark:bg-slate-950 shadow-sm border-b border-primary-100 dark:border-primary-900 p-4 flex justify-between items-center sticky top-0 z-30">
        <button onClick={toggleSidebar} className="text-primary-600 dark:text-primary-400 p-2">
          <Menu className="w-6 h-6" />
        </button>        <div className="text-primary-900 dark:text-primary-400 font-bold text-lg">Eureka</div>        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
              {usuario?.nome?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Mobile sidebar */}      <div className={`lg:hidden fixed inset-0 z-40 ${isSidebarOpen ? 'block' : 'hidden'}`}>
        <div className="absolute inset-0 bg-black/50" onClick={toggleSidebar}></div>
        <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-lg flex flex-col">
          <div className="p-4 border-b border-primary-100 flex justify-between items-center">
            <div className="text-primary-900 font-bold text-xl">Eureka</div>
            <button onClick={toggleSidebar} className="text-primary-600 p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-primary-100">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary-100 text-primary-600">
                    {usuario?.nome?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{usuario?.nome}</div>
                  <div className="text-xs text-muted-foreground">{usuario?.email}</div>
                </div>
              </div>
            </div>
            <nav className="p-2">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>                    <Link 
                      href={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                        isActive(item.path)
                          ? "bg-primary-100 text-primary-900 font-medium"
                          : "text-primary-700 hover:bg-primary-50"
                      }`}
                      onClick={toggleSidebar}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                      {item.badge ? (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>            </nav>
          </div>          <div className="p-4 border-t border-primary-100 dark:border-primary-900">            <div className="flex justify-end items-center mb-2">
              <Button 
                variant="outline" 
                className="text-red-600 dark:text-red-400 gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="flex-1 flex">        {/* Sidebar desktop */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-primary-100 dark:border-primary-900 bg-white dark:bg-slate-950">
          <div className="p-4 border-b border-primary-100 dark:border-primary-900">
            <div className="text-primary-900 dark:text-primary-400 font-bold text-xl">Eureka</div>
          </div>          <div className="p-4 border-b border-primary-100 dark:border-primary-900">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
                  {usuario?.nome?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium truncate max-w-[160px] dark:text-white">{usuario?.nome}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[160px]">{usuario?.email}</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-2 overflow-y-auto">
            <ul className="space-y-1">              {navItems.map((item) => (
                <li key={item.path}>                  <Link 
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                      isActive(item.path)
                        ? "bg-primary-100 dark:bg-primary-900/50 text-primary-900 dark:text-primary-200 font-medium"
                        : "text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {item.badge ? (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>          </nav>          <div className="p-4 border-t border-primary-100 dark:border-primary-900">
            <div className="flex items-center justify-end mb-2">
              <Button 
                variant="outline" 
                className="text-red-600 dark:text-red-400 gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
