"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function HomePage() {
  const [search, setSearch] = useState("");

  // Futuramente: buscar avaliações/quizzes da API
  // const { data, isLoading } = useAvaliacoes({ search });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Bem-vindo ao Eureka!
        </h1>
        <form
          className="flex items-center gap-2 mb-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="text"
            className="flex-1 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Pesquisar avaliações, quizzes ou disciplinas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="p-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
        {/* Resultados de busca e filtros aparecerão aqui futuramente */}
        <div className="text-center text-muted-foreground">
          Digite para pesquisar avaliações ou quizzes disponíveis.
        </div>
      </div>
    </main>
  );
}
