"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useEstudante } from "@/hooks/useEstudante";
import { useRouter } from "next/navigation";
import { Search, Book, ClockIcon, Award, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EstudanteQuiz } from "@/types/estudanteQuiz";
import { Quiz } from "@/types/quiz";
import { primary } from "@/lib/colors";
import { useDisciplinas } from "@/hooks/useDisciplinas";

export default function HistoricoQuizzesPage() {
  const { estudante } = useEstudante().usePerfilEstudante();
  const { quizzes, isLoading } = useEstudante().useQuizzes(estudante?._id);
  const router = useRouter();  const [filtro, setFiltro] = useState({
    disciplina: "todas",
    resultado: "todos",
    search: ""
  });
    // Buscar disciplinas
  const disciplinasQuery = useDisciplinas({
    page: 1,
    limit: 100,
    ativo: true,
    sortBy: 'nome',
    sortOrder: 'asc'
  });
  
  const disciplinasFromAPI = disciplinasQuery.data?.disciplinas || [];

  // Formatação de data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatação de tempo
  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  // Formatação de percentual
  const formatarPercentual = (valor: number) => {
    return `${(valor * 100).toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary-700">Carregando seu histórico...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Verificar se o usuário é um estudante
  if (!estudante) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="p-6 bg-primary-50 border border-primary-200 rounded-lg text-center max-w-md">
            <h1 className="text-xl font-bold text-primary-800 mb-3">Acesso Limitado</h1>
            <p className="text-primary-700 mb-4">
              Sua conta não tem perfil de estudante associado. Não é possível visualizar histórico de quizzes.
            </p>
            <p className="text-sm text-primary-600 mb-4">
              Entre em contato com o administrador para mais informações.
            </p>
            <Button 
              variant="default" 
              className="bg-primary-500 hover:bg-primary-600"
              onClick={() => router.push('/dashboard')}
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
    // Filtragem de quizzes
  const quizzesFiltrados = quizzes?.filter((tentativa: EstudanteQuiz) => {
    // Filtra por disciplina
    if (filtro.disciplina && filtro.disciplina !== "todas" && 
        typeof tentativa.quiz === 'object' &&
        typeof tentativa.quiz.avaliacao === 'object' &&
        typeof tentativa.quiz.avaliacao.disciplina === 'object' &&
        tentativa.quiz.avaliacao.disciplina._id !== filtro.disciplina) {
      return false;
    }
      // Filtra por resultado
    if (filtro.resultado && filtro.resultado !== "todos") {
      if (filtro.resultado === "excelente" && tentativa.percentualAcerto < 0.8) return false;
      if (filtro.resultado === "bom" && (tentativa.percentualAcerto < 0.6 || tentativa.percentualAcerto >= 0.8)) return false;
      if (filtro.resultado === "medio" && (tentativa.percentualAcerto < 0.4 || tentativa.percentualAcerto >= 0.6)) return false;
      if (filtro.resultado === "insuficiente" && tentativa.percentualAcerto >= 0.4) return false;
    }
    
    // Filtra por termo de busca
    if (filtro.search && typeof tentativa.quiz === 'object' && 
        !tentativa.quiz.titulo.toLowerCase().includes(filtro.search.toLowerCase())) {
      return false;
    }
      return true;
  });

  // Vamos usar apenas as disciplinas da API ao invés de extrair dos quizzes

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Histórico de Quizzes</h1>
            <p className="text-primary-700">Visualize seu desempenho nos quizzes realizados</p>
          </div>
          <Button 
            variant="default" 
            className="bg-primary-500 hover:bg-primary-600"
            onClick={() => router.push('/dashboard/quizzes')}
          >
            Realizar mais quizzes
          </Button>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Filtrar Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Disciplina</label>                <Select
                  value={filtro.disciplina}
                  onValueChange={(value) => setFiltro({...filtro, disciplina: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as disciplinas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as disciplinas</SelectItem>
                    {disciplinasFromAPI.map((disciplina) => (
                      <SelectItem key={disciplina._id} value={disciplina._id}>
                        {disciplina.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Resultado</label>
                <Select
                  value={filtro.resultado}
                  onValueChange={(value) => setFiltro({...filtro, resultado: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os resultados" />
                  </SelectTrigger>                  <SelectContent>
                    <SelectItem value="todos">Todos os resultados</SelectItem>
                    <SelectItem value="excelente">Excelente (80-100%)</SelectItem>
                    <SelectItem value="bom">Bom (60-79%)</SelectItem>
                    <SelectItem value="medio">Médio (40-59%)</SelectItem>
                    <SelectItem value="insuficiente">Insuficiente (0-39%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-1">Buscar</label>
                <div className="relative">
                  <Input
                    placeholder="Buscar quiz..."
                    value={filtro.search}
                    onChange={(e) => setFiltro({...filtro, search: e.target.value})}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {quizzesFiltrados?.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-12 h-12 mx-auto text-primary-400 mb-4" />
            <h2 className="text-lg font-semibold text-primary-900 mb-2">Nenhum quiz realizado</h2>
            <p className="text-primary-700 mb-6">Você ainda não respondeu nenhum quiz.</p>
            <Button 
              className="bg-primary-500 hover:bg-primary-600 text-white"
              onClick={() => router.push('/dashboard/quizzes')}
            >
              Explorar quizzes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzesFiltrados?.map((tentativa: EstudanteQuiz) => (
              <Card key={tentativa._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Badge variant="outline" className={`${
                      tentativa.percentualAcerto >= 0.8
                        ? 'bg-green-50 text-green-700'
                        : tentativa.percentualAcerto >= 0.6
                        ? 'bg-blue-50 text-blue-700'
                        : tentativa.percentualAcerto >= 0.4
                        ? 'bg-primary-50 text-primary-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {formatarPercentual(tentativa.percentualAcerto)}
                    </Badge>
                    {typeof tentativa.quiz === 'object' && 
                     typeof tentativa.quiz.avaliacao === 'object' && 
                     typeof tentativa.quiz.avaliacao.disciplina === 'object' && (
                      <Badge variant="outline" className="bg-primary-50 text-primary-700">
                        {tentativa.quiz.avaliacao.disciplina.nome}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg text-primary-900 mt-2 line-clamp-2">
                    {typeof tentativa.quiz === 'object' ? tentativa.quiz.titulo : 'Quiz não encontrado'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-primary-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatarData(tentativa.dataInicio)}
                    </div>
                    <div className="flex items-center text-primary-700">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      {formatarTempo(tentativa.tempoTotal)}
                    </div>
                    <div className="flex items-center text-primary-700">
                      <Award className="w-4 h-4 mr-2" />
                      {tentativa.acertos} de {tentativa.respostas.length} questões
                    </div>
                  </div>
                  
                  <Button
                    className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-white"
                    onClick={() => router.push(`/dashboard/quizzes/resultado/${tentativa._id}`)}
                  >
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
