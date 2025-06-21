"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQuizResposta } from "@/hooks/useQuizResposta";
import { useQuiz } from "@/hooks/useQuizzes";
import { CheckCircle, XCircle, AlertCircle, Clock, Award, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { EstudanteQuiz } from "@/types/estudanteQuiz";
import { Quiz, QuestaoQuiz} from "@/types/quiz";
import { Avaliacao } from "@/types/avaliacao";
import { Disciplina } from "@/types/disciplina";

export default function ResultadoQuizPage({ params }: { params: { id: string } }) {
  const { usuario } = useAuth();
  const router = useRouter();
  const { tentativaAtual, isLoading: isLoadingTentativa } = useQuizResposta(params.id);
  const quizId = typeof tentativaAtual?.quiz === 'string' ? tentativaAtual.quiz : tentativaAtual?.quiz?._id;
  const { quiz, isLoading: isLoadingQuiz } = useQuiz(quizId);
  const [questoesAbertas, setQuestoesAbertas] = useState<Record<string, boolean>>({});
  
  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!usuario) {
      router.push('/login');
    }
  }, [usuario, router]);

  // Getter para acessar as questões
  const getQuestoes = () => {
    if (!quiz || !quiz.avaliacao?.questoes) return [];
    return quiz.avaliacao.questoes;
  };

  const isLoading = isLoadingTentativa || isLoadingQuiz || !tentativaAtual || !quiz;

  // Formatar o tempo
  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    
    if (minutos === 0) {
      return `${segs} segundos`;
    } else if (segs === 0) {
      return `${minutos} minutos`;
    } else {
      return `${minutos} minutos e ${segs} segundos`;
    }
  };

  // Alternar a visibilidade de uma questão
  const toggleQuestao = (questaoId: string) => {
    setQuestoesAbertas(prev => ({
      ...prev,
      [questaoId]: !prev[questaoId]
    }));
  };

  // Formatar percentual
  const formatarPercentual = (valor: number) => {
    return `${Math.round(valor * 100)}%`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary-800">Carregando resultado...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!tentativaAtual || !quiz) {
    return (      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="w-16 h-16 text-primary-400" />
          <p className="mt-4 text-primary-800">Quiz não encontrado</p>
          <Button onClick={() => router.push('/dashboard/quizzes')} className="mt-4 bg-primary-500 hover:bg-primary-600 text-white">
            Voltar para Quizzes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const avaliacao = typeof quiz.avaliacao === 'string' ? null : quiz.avaliacao;
  const disciplina = avaliacao?.disciplina && typeof avaliacao.disciplina !== 'string' ? avaliacao.disciplina : null;
  const disciplinaNome = disciplina?.nome || 'Disciplina não especificada';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/quizzes')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Quizzes
            </Button>
            <h1 className="text-2xl font-bold text-primary-900">{quiz.titulo}</h1>
            <p className="text-primary-700">{disciplinaNome}</p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-primary-50 to-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                <Award className="h-8 w-8 text-primary-500 mb-2" />
                <span className="text-sm text-primary-700">Pontuação</span>
                <span className="text-2xl font-bold text-primary-900">
                  {tentativaAtual.pontuacaoObtida || 0}/{tentativaAtual.totalPontos || 0}
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-sm text-primary-700">Acertos</span>
                <span className="text-2xl font-bold text-green-600">
                  {tentativaAtual.respostasCorretas}/{tentativaAtual.totalQuestoes}
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                <Clock className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-sm text-primary-700">Tempo Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatarTempo(tentativaAtual.tempoTotal || 0)}
                </span>
              </div>

              <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-primary-900">Resultado:</span>                  <span className={`font-medium ${
                    tentativaAtual.percentualAcerto >= 0.8 
                      ? "text-green-600" 
                      : tentativaAtual.percentualAcerto >= 0.6 
                      ? "text-blue-600" 
                      : tentativaAtual.percentualAcerto >= 0.4
                      ? "text-primary-600"
                      : "text-red-600"
                  }`}>
                    {tentativaAtual.percentualAcerto >= 0.8 
                      ? "Excelente" 
                      : tentativaAtual.percentualAcerto >= 0.6 
                      ? "Bom" 
                      : tentativaAtual.percentualAcerto >= 0.4
                      ? "Médio"
                      : "Insuficiente"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-primary-900 mb-4">Respostas</h2>
        
        <div className="space-y-4">
          {tentativaAtual.respostas.map((resposta, index) => {
            const questao = getQuestoes().find(q => q._id === resposta.questao);
            const isAberta = questoesAbertas[resposta.questao] || false;
            
            if (!questao) return null;
            
            return (
              <Card 
                key={resposta.questao} 
                className={`overflow-hidden transition-all ${
                  resposta.correta
                    ? 'bg-gradient-to-r from-green-50 to-white border-l-4 border-l-green-500'
                    : 'bg-gradient-to-r from-red-50 to-white border-l-4 border-l-red-500'
                }`}
              >
                <CardHeader className="cursor-pointer" onClick={() => toggleQuestao(resposta.questao)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {resposta.correta ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <CardTitle className="text-base font-medium">
                        {index + 1}. {questao.enunciado}
                      </CardTitle>
                    </div>
                    {isAberta ? (
                      <ChevronUp className="h-5 w-5 text-primary-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-primary-500" />
                    )}
                  </div>
                </CardHeader>

                {isAberta && (
                  <CardContent>
                    <div className="grid gap-4">
                      {questao.alternativas.map(alternativa => (
                        <div                          key={alternativa._id}
                          className={`p-3 rounded-lg border ${
                            alternativa._id === resposta.alternativa
                              ? alternativa.correta
                                ? 'bg-green-100 border-green-500'
                                : 'bg-red-100 border-red-500'
                              : alternativa.correta
                              ? 'bg-green-50 border-green-500'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {alternativa._id === resposta.alternativa && alternativa.correta && (
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            )}
                            {alternativa._id === resposta.alternativa && !alternativa.correta && (
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            )}
                            {alternativa._id !== resposta.alternativa && alternativa.correta && (
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            )}
                            <p>{alternativa.texto}</p>
                          </div>
                        </div>
                      ))}

                      <div className="mt-4">
                        <Badge className={
                          resposta.correta ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }>
                          {resposta.correta ? "Resposta Correta" : "Resposta Incorreta"}
                        </Badge>
                        {resposta.tempo && (
                          <Badge className="ml-2 bg-blue-100 text-blue-800">
                            Tempo: {formatarTempo(resposta.tempo)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
