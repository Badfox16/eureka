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

export default function HistoricoQuizzesPage() {
  const { estudante } = useEstudante().usePerfilEstudante();
  const { quizzes, isLoading } = useEstudante().useQuizzes(estudante?._id);
  const router = useRouter();
  const [filtro, setFiltro] = useState({
    disciplina: "",
    resultado: "",
    search: ""
  });

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
    return `${valor.toFixed(1)}%`;
  };

  // Filtragem de quizzes
  const quizzesFiltrados = quizzes?.filter((q: EstudanteQuiz) => {
    if (filtro.disciplina && typeof q.quiz === 'object' && q.quiz.avaliacao && 
        typeof q.quiz.avaliacao === 'object' && 
        typeof q.quiz.avaliacao.disciplina === 'object' && 
        q.quiz.avaliacao.disciplina._id !== filtro.disciplina) {
      return false;
    }

    if (filtro.resultado) {
      const percentual = (q.respostasCorretas / q.totalQuestoes) * 100;
      if (filtro.resultado === 'aprovado' && percentual < 70) return false;
      if (filtro.resultado === 'reprovado' && percentual >= 70) return false;
    }

    if (filtro.search) {
      const searchLower = filtro.search.toLowerCase();
      return typeof q.quiz === 'object' && q.quiz.titulo.toLowerCase().includes(searchLower);
    }

    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-orange-900">Histórico de Quizzes</h1>
            <p className="text-orange-700">Acompanhe seu desempenho nos quizzes realizados</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border border-orange-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-orange-500" />
              <Input
                type="text"
                placeholder="Pesquisar por título..."
                className="pl-9"
                value={filtro.search}
                onChange={(e) => setFiltro({ ...filtro, search: e.target.value })}
              />
            </div>
            
            <Select
              value={filtro.disciplina}
              onValueChange={(value) => setFiltro({ ...filtro, disciplina: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por disciplina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as disciplinas</SelectItem>
                <SelectItem value="matematica">Matemática</SelectItem>
                <SelectItem value="portugues">Português</SelectItem>
                <SelectItem value="fisica">Física</SelectItem>
                <SelectItem value="quimica">Química</SelectItem>
                <SelectItem value="biologia">Biologia</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filtro.resultado}
              onValueChange={(value) => setFiltro({ ...filtro, resultado: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os resultados</SelectItem>
                <SelectItem value="otimo">Ótimo (≥ 80%)</SelectItem>
                <SelectItem value="bom">Bom (60-79%)</SelectItem>
                <SelectItem value="regular">Regular (40-59%)</SelectItem>
                <SelectItem value="ruim">Precisa melhorar (≤ 39%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-orange-800">Carregando seu histórico...</p>
          </div>
        ) : !quizzes || quizzes.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-12 h-12 mx-auto text-orange-400 mb-4" />
            <h2 className="text-lg font-semibold text-orange-900 mb-2">Nenhum quiz realizado</h2>
            <p className="text-orange-700 mb-6">Você ainda não respondeu nenhum quiz.</p>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => router.push('/dashboard/quizzes')}
            >
              Explorar quizzes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzesFiltrados?.map((tentativa) => (
              <Card key={tentativa._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <Badge variant="outline" className={`${
                      tentativa.percentualAcerto >= 0.8
                        ? 'bg-green-50 text-green-700'
                        : tentativa.percentualAcerto >= 0.6
                        ? 'bg-blue-50 text-blue-700'
                        : tentativa.percentualAcerto >= 0.4
                        ? 'bg-orange-50 text-orange-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {formatarPercentual(tentativa.percentualAcerto)}
                    </Badge>                    {typeof tentativa.quiz === 'object' && 
                     typeof tentativa.quiz.avaliacao === 'object' && 
                     typeof tentativa.quiz.avaliacao.disciplina === 'object' && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700">
                        {tentativa.quiz.avaliacao.disciplina.nome}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg text-orange-900 mt-2 line-clamp-2">
                    {typeof tentativa.quiz === 'object' ? tentativa.quiz.titulo : 'Quiz não encontrado'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-orange-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatarData(tentativa.dataInicio)}
                    </div>
                    <div className="flex items-center text-orange-700">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      {formatarTempo(tentativa.tempoTotal)}
                    </div>
                    <div className="flex items-center text-orange-700">
                      <Award className="w-4 h-4 mr-2" />
                      {tentativa.acertos} de {tentativa.respostas.length} questões
                    </div>
                  </div>
                  
                  <Button
                    className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
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
