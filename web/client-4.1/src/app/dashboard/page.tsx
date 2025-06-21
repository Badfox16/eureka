"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEstudante } from "@/hooks/useEstudante";
import { useEstatisticas } from "@/hooks/useEstatisticas";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, Calendar, ArrowRight, BarChart2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { primary } from "@/lib/colors";

export default function DashboardPage() {
  const { usuario, isAuthenticatedSync } = useAuth();
  const { estudante: perfil, isLoading: isLoadingPerfil } = useEstudante().usePerfilEstudante();
  const { estatisticasGerais, estatisticasDisciplinas, evolucaoDesempenho } = useEstatisticas(perfil?._id);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Verificar autenticação de forma síncrona no carregamento da página
  useEffect(() => {
    if (!isAuthenticatedSync()) {
      router.replace('/login');
    } else {
      // Se estiver autenticado, permitir que a página continue carregando
      setIsLoading(false);
    }
  }, [router, isAuthenticatedSync]);
  
  // Redirecionar se não estiver autenticado (verificação assíncrona)
  useEffect(() => {
    if (!usuario) {
      router.replace('/login');
    }
  }, [usuario, router]);  if (isLoading || isLoadingPerfil || estatisticasGerais.isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className={`w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin`}></div>
          <p className="mt-4 text-primary-700">Carregando seu dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  // Verificar se o usuário é um estudante
  if (!perfil) {
    return (
      <DashboardLayout>        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="p-6 bg-primary-50 border border-primary-200 rounded-lg text-center max-w-md">
            <h1 className="text-xl font-bold text-primary-800 mb-3">Acesso Limitado</h1>
            <p className="text-primary-700 mb-4">
              Sua conta não tem perfil de estudante associado. Algumas funcionalidades podem não estar disponíveis.
            </p>
            <p className="text-sm text-primary-600">
              Entre em contato com o administrador para mais informações.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Calcular disciplinas fortes (com percentual de acerto > 70%)
  const disciplinasFortes = estatisticasGerais.data?.disciplinasFortes || [];

  // Pegar estatísticas gerais
  const stats = estatisticasGerais.data || {
    quizzesCompletos: 0,
    mediaAcertos: 0,
    totalPontos: 0
  };

  // Pegar evolução de desempenho
  const evolucao = evolucaoDesempenho.data || [];
  const ultimoDesempenho = evolucao[evolucao.length - 1]?.percentual || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary-900">Olá, {perfil?.nome?.split(' ')[0]}!</h1>
            <p className="text-primary-700">Confira seu progresso e continue estudando.</p>
          </div>
          <Link href="/dashboard/quizzes" passHref>
            <Button variant="default" className="bg-primary-500 hover:bg-primary-600">
              <BookOpen className="h-5 w-5 mr-2" />
              Praticar Quizzes
            </Button>
          </Link>
        </section>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Quizzes</CardTitle>
              <BookOpen className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900">{stats.quizzesCompletos}</div>
              <p className="text-xs text-primary-700">realizados até agora</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média de Acertos</CardTitle>
              <Award className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900">{stats.mediaAcertos}%</div>
              <p className="text-xs text-primary-700">em todos os quizzes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disciplinas Fortes</CardTitle>
              <BarChart2 className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900">{disciplinasFortes.length}</div>
              <p className="text-xs text-primary-700">com aproveitamento &gt;70%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Evolução Recente</CardTitle>
              <Calendar className="h-4 w-4 text-primary-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900">{ultimoDesempenho}%</div>
              <p className="text-xs text-primary-700">no último quiz</p>
            </CardContent>
          </Card>
        </div>

        {/* Link para mais detalhes */}
        <div className="text-right">
          <Link href="/dashboard/quizzes/historico" className="text-primary-500 hover:text-primary-600 inline-flex items-center">
            Ver histórico completo <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
