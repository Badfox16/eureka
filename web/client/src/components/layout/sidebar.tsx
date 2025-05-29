"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, BookOpenIcon, GraduationCapIcon, ChartBarIcon, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  {
    path: "/dashboard",
    name: "Início",
    icon: HomeIcon,
  },
  {
    path: "/disciplinas",
    name: "Disciplinas",
    icon: BookOpenIcon,
  },
  {
    path: "/avaliacoes",
    name: "Avaliações",
    icon: GraduationCapIcon,
  },
  {
    path: "/estatisticas",
    name: "Estatísticas",
    icon: ChartBarIcon,
  },
  {
    path: "/perfil",
    name: "Perfil",
    icon: UserIcon,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[250px] flex-col border-r bg-white dark:bg-slate-900">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image 
            src="/logo.png" 
            alt="Eureka" 
            width={32} 
            height={32} 
            className="h-8 w-8" 
          />
          <span className="text-xl font-bold text-primary-600">Eureka</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium",
              pathname === item.path
                ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}