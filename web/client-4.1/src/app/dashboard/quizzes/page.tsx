"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuizzes } from "@/hooks/useQuizzes";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Clock, BookOpen, ArrowRight, Filter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Quiz } from "@/types/quiz";
import { QuizSearchParams } from "@/types/search";
import { Badge } from "@/components/ui/badge";
import { primary } from "@/lib/colors";
import { useDisciplinas } from "@/hooks/useDisciplinas";

export default function QuizzesPage() {  const [searchParams, setSearchParams] = useState<QuizSearchParams>({
    page: 1,
    limit: 9,
    ativo: true
  });
    const [searchText, setSearchText] = useState("");
  const [disciplinaFiltro, setDisciplinaFiltro] = useState<string>("todas");
  const [showFilters, setShowFilters] = useState(false);
  
  const { quizzes, pagination, isLoading, refetch } = useQuizzes(searchParams);
    // Obter as disciplinas para o filtro
  const disciplinasQuery = useDisciplinas({
    page: 1,
    limit: 100,
    ativo: true,
    sortBy: 'nome',
    sortOrder: 'asc'
  });
  
  const disciplinas = disciplinasQuery.data?.disciplinas || [];
    const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = {
      ...searchParams,
      search: searchText,
      page: 1
    };
    
    // Adiciona o filtro de disciplina apenas se não for "todas"
    if (disciplinaFiltro && disciplinaFiltro !== "todas") {
      params.disciplina = disciplinaFiltro;
    } else {
      // Remove o parâmetro disciplina se for "todas"
      delete params.disciplina;
    }
    
    setSearchParams(params);
  };
  
  const handleChangePage = (page: number) => {
    setSearchParams({
      ...searchParams,
      page
    });
  };
  
  const limparFiltros = () => {
    setSearchText("");
    setDisciplinaFiltro("");
    setSearchParams({
      page: 1,
      limit: 9,
      ativo: true
    });
  };
  
  // Formatação de data e tempo
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  const formatarTempo = (minutos?: number) => {
    if (!minutos) return "Sem limite";
    
    if (minutos < 60) {
      return `${minutos} min`;
    }
    
    const horas = Math.floor(minutos / 60);
    const min = minutos % 60;
    
    if (min === 0) {
      return `${horas}h`;
    }
    
    return `${horas}h ${min}min`;
  };

  // Obter o nome da disciplina
  const getDisciplinaNome = (quiz: any) => {
    if (typeof quiz.avaliacao === 'object' && quiz.avaliacao.disciplina) {
      return typeof quiz.avaliacao.disciplina === 'object' 
        ? quiz.avaliacao.disciplina.nome 
        : 'Disciplina';
    }
    return 'Disciplina';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">          <div>
            <h1 className="text-2xl font-bold text-primary-900">Quizzes disponíveis</h1>
            <p className="text-primary-700">Escolha um quiz para testar seus conhecimentos</p>
          </div>
          
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-500" />
                <Input
                  type="text"
                  placeholder="Buscar quizzes..."
                  className="pl-10 pr-4 py-2 w-full md:w-[250px]"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <Button type="submit" className="ml-2 bg-primary-500 hover:bg-primary-600 text-white">
                Buscar
              </Button>
            </form>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="ml-1"
              aria-label="Filtros avançados"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-auto flex-1">
                <label htmlFor="disciplina" className="block text-sm font-medium mb-1 text-primary-900">
                  Disciplina
                </label>
                <Select
                  value={disciplinaFiltro}
                  onValueChange={setDisciplinaFiltro}
                >                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todas as disciplinas" />
                  </SelectTrigger>                  <SelectContent>
                    <SelectItem value="todas">Todas as disciplinas</SelectItem>
                    {disciplinas.map((disciplina) => (
                      <SelectItem key={disciplina._id} value={disciplina._id}>
                        {disciplina.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full md:w-auto"
                  onClick={limparFiltros}
                >
                  Limpar filtros
                </Button>
                <Button 
                  type="button" 
                  className="w-full md:w-auto bg-primary-500 hover:bg-primary-600 text-white"
                  onClick={handleSearch}
                >
                  Aplicar filtros
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">            <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-primary-800">Carregando quizzes...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-primary-400 mb-4" />
            <h2 className="text-lg font-semibold text-primary-900 mb-2">Nenhum quiz encontrado</h2>
            <p className="text-primary-700 mb-6">Tente ajustar os filtros de busca ou tente novamente mais tarde.</p>
            
            {(searchParams.search || searchParams.disciplina) && (
              <Button 
                onClick={limparFiltros}
                variant="outline"
                className="mx-auto"
              >
                Limpar busca
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz: Quiz) => (
                <Card key={quiz._id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg font-bold text-primary-900 line-clamp-2">{quiz.titulo}</CardTitle>
                      <Badge className="bg-primary-100 hover:bg-primary-200 text-primary-800 text-xs">
                        {getDisciplinaNome(quiz)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-primary-700 text-sm line-clamp-3 mb-4">
                      {quiz.descricao || "Sem descrição disponível."}
                    </p>
                    <div className="flex flex-wrap gap-y-2 text-xs text-primary-600">
                      <div className="flex items-center mr-4">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatarData(quiz.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatarTempo(quiz.tempoLimite)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full bg-primary-500 hover:bg-primary-600 text-white">
                      <Link href={`/dashboard/quizzes/${quiz._id}`}>
                        Iniciar quiz <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangePage(Math.max(1, searchParams.page - 1))}
                  disabled={searchParams.page <= 1}
                >
                  Anterior
                </Button>
                
                <span className="text-sm text-primary-700">
                  Página {searchParams.page} de {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangePage(Math.min(pagination.totalPages, searchParams.page + 1))}
                  disabled={searchParams.page >= pagination.totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
