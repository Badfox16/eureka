"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/hooks/useQuizzes";
import { useRouter } from "next/navigation";
import { ApiStatus } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";

export default function QuizPage({ params }: { params: { id: string } }) {
  // Usar desestruturação para evitar o aviso do Next.js sobre acesso direto a params
  const { id } = params;
  
  const { usuario } = useAuth();
  const router = useRouter();
  const { quiz, isLoading } = useQuiz(id);
  const [step, setStep] = useState<number>(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  const [tempoPorQuestao, setTempoPorQuestao] = useState<Record<string, number>>({});
  const [tempoInicio, setTempoInicio] = useState<Date | null>(null);
    // Getter para acessar as questões
  const getQuestoes = () => {
    if (!quiz || !quiz.avaliacao?.questoes) return [];
    return quiz.avaliacao.questoes;
  };

  // Getter para a questão atual
  const getQuestaoAtual = () => {
    const questoes = getQuestoes();
    return questoes[step] || null;
  };

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!usuario) {
      router.push('/login');
    }
  }, [usuario, router]);
  // Iniciar o tempo quando o quiz carregar
  useEffect(() => {
    if (quiz && !tempoInicio) {
      setTempoInicio(new Date());
    }
  }, [quiz, tempoInicio]);  // Atualizar o tempo por questão quando mudar de questão
  useEffect(() => {
    const questoes = getQuestoes();
    if (questoes.length > 0 && step > 0 && step <= questoes.length && tempoInicio) {
      const questaoAtual = questoes[step - 1];
      if (!questaoAtual) return;

      const questaoId = questaoAtual._id;
      const startTime = new Date();
      
      return () => {
        const endTime = new Date();
        const tempo = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
        setTempoPorQuestao(prev => ({
          ...prev,
          [questaoId]: (prev[questaoId] || 0) + tempo
        }));
      };
    }
  }, [step]);

  // Selecionar uma opção
  const selecionarOpcao = (questaoId: string, opcaoId: string) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: opcaoId
    }));
  };  // Avançar para a próxima questão
  const avancar = () => {
    const questoes = getQuestoes();
    if (step < questoes.length) {
      setStep(step + 1);
    } else {
      finalizarQuiz();
    }
  };

  // Voltar para a questão anterior
  const voltar = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Finalizar o quiz
  const finalizarQuiz = async () => {
    if (!quiz) return;
    
    setStatus(ApiStatus.LOADING);
    
    try {
      // Aqui você implementaria a lógica para enviar as respostas para a API
      // usando o hook useQuizResposta ou similar
      
      // Exemplo:
      // await enviarRespostasQuiz({
      //   quizId: quiz._id,
      //   respostas: Object.entries(respostas).map(([questaoId, opcaoId]) => ({
      //     questao: questaoId,
      //     opcaoSelecionada: opcaoId,
      //     tempoResposta: tempoPorQuestao[questaoId] || 0
      //   })),
      //   tempoTotal: Math.round((new Date().getTime() - (tempoInicio?.getTime() || 0)) / 1000)
      // });
      
      // Simular tempo de resposta
      await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus(ApiStatus.SUCCESS);
      
      // Redirecionar para a página de resultados
      router.push(`/dashboard/quizzes/resultado/${id}`);
    } catch (error) {
      console.error("Erro ao enviar respostas:", error);
      setStatus(ApiStatus.ERROR);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary-800">Carregando quiz...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center text-primary-800">
            <h2 className="text-2xl font-bold mb-2">Quiz não encontrado</h2>
            <p className="mb-4">O quiz que você está procurando não existe ou foi removido.</p>
            <Button 
              className="bg-primary-500 hover:bg-primary-600 text-white"
              onClick={() => router.push('/dashboard/quizzes')}
            >
              Voltar para quizzes
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Se ainda não começou a responder o quiz
  if (step === 0 && Object.keys(respostas).length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-primary-900">{quiz.titulo}</CardTitle>
              <CardDescription>{quiz.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary-900">Disciplina:</span>
                  <span>
                    {typeof quiz.avaliacao === 'string' 
                      ? 'Não especificada' 
                      : typeof quiz.avaliacao?.disciplina === 'string' 
                        ? 'Não especificada'
                        : quiz.avaliacao?.disciplina?.nome || 'Não especificada'}
                  </span>                </div>                <div className="flex items-center gap-2">                  <span className="font-medium text-primary-900">Número de questões:</span>
                  <span>{getQuestoes().length}</span>
                </div>
                {quiz.tempoLimite && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary-900">Tempo limite:</span>
                    <span>{quiz.tempoLimite} minutos</span>
                  </div>
                )}
              </div>
              
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                <h3 className="font-medium text-primary-900 mb-2">Instruções:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-primary-800">
                  <li>Leia atentamente cada questão antes de responder.</li>
                  <li>Você pode navegar entre as questões usando os botões abaixo.</li>
                  <li>Uma vez finalizado, não será possível refazer este quiz.</li>
                  {quiz.tempoLimite && (
                    <li>O quiz tem um tempo limite de {quiz.tempoLimite} minutos.</li>
                  )}
                </ul>
              </div>
              
              <Button 
                className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                onClick={() => setStep(1)}
              >
                Iniciar Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );  }
  // Verificações de segurança
  const questoes = getQuestoes();
  if (!quiz || questoes.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center text-primary-800">
            <h2 className="text-2xl font-bold mb-2">Quiz inválido</h2>
            <p className="mb-4">Este quiz não possui questões ou está mal formatado.</p>
            <Button 
              className="bg-primary-500 hover:bg-primary-600 text-white"
              onClick={() => router.push('/dashboard/quizzes')}
            >
              Voltar para quizzes
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  // Questão atual - Com verificação de segurança
  const questaoAtual = getQuestoes().length > 0 && step > 0 && step <= getQuestoes().length ? getQuestoes()[step - 1] : null;
  const opcaoSelecionada = questaoAtual && questaoAtual._id ? respostas[questaoAtual._id] : undefined;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-md">          <CardHeader>            <div className="flex justify-between items-center">
              <CardTitle className="text-xl text-primary-900">{quiz.titulo}</CardTitle>              <div className="text-sm font-medium bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
                Questão {step} de {getQuestoes().length}
              </div>
            </div></CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary-50 p-4 rounded-lg">
              {questaoAtual ? (
                <>
                  <h3 className="text-lg font-medium text-primary-900 mb-3">{questaoAtual.enunciado}</h3>
                  
                  <div className="space-y-2 mt-4">
                    {questaoAtual.alternativas && questaoAtual.alternativas.map((alternativa) => (
                      <div                        key={alternativa._id}
                        onClick={() => selecionarOpcao(questaoAtual._id, alternativa._id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          opcaoSelecionada === alternativa._id
                            ? 'bg-primary-200 border-primary-400 text-primary-900'
                            : 'bg-white border-primary-100 hover:bg-primary-50 text-primary-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            opcaoSelecionada === alternativa._id
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-primary-300'
                          }`}>
                            {opcaoSelecionada === alternativa._id && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span>{alternativa.texto}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p>Questão não encontrada. Por favor, tente novamente.</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">              <Button 
                variant="outline" 
                onClick={voltar}
                disabled={step <= 1}
              >
                Anterior
              </Button>
              <Button 
                className="bg-primary-500 hover:bg-primary-600 text-white"
                onClick={avancar}
                disabled={!opcaoSelecionada || status === ApiStatus.LOADING}
              >                {status === ApiStatus.LOADING ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Enviando...
                  </>
                ) : step === getQuestoes().length ? (
                  'Finalizar Quiz'
                ) : (
                  'Próxima'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
