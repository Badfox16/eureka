"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useQuizResposta } from "@/hooks/useQuizResposta";
import { CheckCircle, XCircle, AlertCircle, Clock, Award, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export default function ResultadoQuizPage() {
  const params = useParams();
  const id = params.id as string;
  const { usuario } = useAuth();
  const router = useRouter();
  const { tentativaAtual, isLoading: isLoadingTentativa } = useQuizResposta(id, true);  const [questoesAbertas, setQuestoesAbertas] = useState<Record<string, boolean>>({});

  // Verificar se é o resultado detalhado (novo formato)
  const isResultadoDetalhado = tentativaAtual && 'quiz' in tentativaAtual && 'tentativa' in tentativaAtual && 'respostas' in tentativaAtual;

  // Funções auxiliares para extrair dados independente do formato
  const getDadosQuiz = () => {
    if (isResultadoDetalhado) {
      const resultado = tentativaAtual as any;
      return {
        id: resultado.quiz.id,
        titulo: resultado.quiz.titulo,
        descricao: resultado.quiz.descricao,
        disciplina: resultado.quiz.disciplina,
        avaliacao: resultado.quiz.avaliacao
      };
    }
    return null;
  };

  const getDadosTentativa = () => {
    if (isResultadoDetalhado) {
      const resultado = tentativaAtual as any;
      return {
        id: resultado.tentativa.id,
        dataInicio: resultado.tentativa.dataInicio,
        dataFim: resultado.tentativa.dataFim,
        duracao: resultado.tentativa.duracao,
        percentualAcerto: resultado.tentativa.percentualAcerto,
        pontuacaoObtida: resultado.tentativa.pontuacaoObtida,
        totalPontos: resultado.tentativa.totalPontos,
        respostasCorretas: resultado.tentativa.respostasCorretas,
        totalQuestoes: resultado.tentativa.totalQuestoes,
        tempoTotal: resultado.tentativa.duracao
      };
    }
    return null;
  };

  const getRespostas = () => {
    if (isResultadoDetalhado) {
      return (tentativaAtual as any).respostas || [];
    }
    return [];
  };

  const dadosQuiz = getDadosQuiz();
  const dadosTentativa = getDadosTentativa();
  const respostas = getRespostas();

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

  const isLoading = isLoadingTentativa || !tentativaAtual || !dadosQuiz || !dadosTentativa;

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
  if (!tentativaAtual || !dadosQuiz || !dadosTentativa) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <AlertCircle className="w-16 h-16 text-primary-400" />
            <p className="mt-4 text-primary-800">Quiz não encontrado</p>
            <Button onClick={() => router.push('/dashboard/quizzes')} className="mt-4 bg-primary-500 hover:bg-primary-600 text-white">
              Voltar para Quizzes
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const disciplinaNome = dadosQuiz.disciplina?.nome || 'Disciplina não especificada';

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
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-primary-900">{dadosQuiz.titulo}</h1>
            <p className="text-primary-600">{disciplinaNome}</p>
          </div>
        </div>

        {/* Estatísticas do Quiz */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontuação Total</CardTitle>
              <Award className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {dadosTentativa.pontuacaoObtida || 0}/{dadosTentativa.totalPontos || 0}
              </div>
              <p className="text-xs text-blue-600">pontos obtidos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acertos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {dadosTentativa.respostasCorretas}/{dadosTentativa.totalQuestoes}
              </div>
              <p className="text-xs text-green-600">questões corretas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Total</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {formatarTempo(dadosTentativa.tempoTotal || 0)}
              </div>
              <p className="text-xs text-purple-600">tempo usado</p>
            </CardContent>
          </Card>
        </div>

        {/* Badge de Performance */}
        <div className="flex justify-center">
          <Badge className={`text-lg px-6 py-2 ${
            dadosTentativa.percentualAcerto >= 80
              ? "bg-green-500 hover:bg-green-600"
              : dadosTentativa.percentualAcerto >= 60
              ? "bg-yellow-500 hover:bg-yellow-600"
              : dadosTentativa.percentualAcerto >= 40
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-red-500 hover:bg-red-600"
          }`}>
            {dadosTentativa.percentualAcerto >= 80
              ? "Excelente"
              : dadosTentativa.percentualAcerto >= 60
              ? "Bom"
              : dadosTentativa.percentualAcerto >= 40
              ? "Regular"
              : "Precisa Melhorar"
            } - {Math.round(dadosTentativa.percentualAcerto)}%
          </Badge>
        </div>

        {/* Detalhes das Questões */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary-900">Respostas Detalhadas</h2>
          
          {respostas.map((resposta: any, index: number) => {
            const questaoId = resposta.questao.id;
            const isAberta = questoesAbertas[questaoId] || false;
            
            return (
              <Card
                key={questaoId}
                className={`border-l-4 ${
                  resposta.resposta.estaCorreta
                    ? "border-l-green-500 bg-green-50"
                    : "border-l-red-500 bg-red-50"
                }`}
              >
                <CardHeader className="cursor-pointer" onClick={() => toggleQuestao(questaoId)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {resposta.resposta.estaCorreta ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <CardTitle className="text-lg">
                        Questão {resposta.questao.numero}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        resposta.resposta.estaCorreta ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }>
                        {resposta.resposta.estaCorreta ? "Resposta Correta" : "Resposta Incorreta"}
                      </Badge>
                      {resposta.resposta.tempoResposta && (
                        <span className="text-sm text-gray-500">
                          Tempo: {formatarTempo(resposta.resposta.tempoResposta)}
                        </span>
                      )}
                      {isAberta ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {isAberta && (
                  <CardContent className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {resposta.questao.enunciado}
                      </h4>
                      {resposta.questao.imagemEnunciadoUrl && (
                        <img 
                          src={resposta.questao.imagemEnunciadoUrl} 
                          alt="Imagem da questão"
                          className="max-w-full h-auto rounded border mt-2"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-900">Alternativas:</h5>
                      {resposta.alternativas.map((alternativa: any) => (
                        <div
                          key={alternativa.letra}
                          className={`p-3 rounded border ${
                            alternativa.letra === resposta.resposta.escolhida && alternativa.correta
                              ? "bg-green-100 border-green-300 text-green-800"
                              : alternativa.letra === resposta.resposta.escolhida && !alternativa.correta
                              ? "bg-red-100 border-red-300 text-red-800"
                              : alternativa.correta
                              ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="font-medium">{alternativa.letra}.</span>
                            <span className="flex-1">{alternativa.texto}</span>
                            {alternativa.letra === resposta.resposta.escolhida && alternativa.correta && (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                            {alternativa.letra === resposta.resposta.escolhida && !alternativa.correta && (
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                            )}
                            {alternativa.letra !== resposta.resposta.escolhida && alternativa.correta && (
                              <div className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Correta</div>
                            )}
                          </div>
                          {alternativa.imagemUrl && (
                            <img 
                              src={alternativa.imagemUrl} 
                              alt={`Alternativa ${alternativa.letra}`}
                              className="max-w-full h-auto rounded border mt-2"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {resposta.explicacao && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-900 mb-2">Explicação:</h5>
                        <p className="text-blue-800">{resposta.explicacao}</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Botão para refazer */}
        <div className="flex justify-center pt-6">
          <Button 
            onClick={() => router.push(`/dashboard/quizzes/${dadosQuiz.id}`)}
            className="bg-primary-500 hover:bg-primary-600 text-white"
          >
            Refazer Quiz
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
