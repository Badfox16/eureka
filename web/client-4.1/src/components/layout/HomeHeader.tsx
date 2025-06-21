"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomeHeader() {
  return (
    <header className="bg-white dark:bg-slate-950 shadow-sm py-4 sticky top-0 z-10 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          Eureka
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Cadastrar</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
