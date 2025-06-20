"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/hooks/useQuizzes";
import { useRouter } from "next/navigation";
import { ApiStatus } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";

export default function QuizPage({ params }: { params: { id: string } }) {
  const { usuario } = useAuth();
  const router = useRouter();
  const { quiz, isLoading } = useQuiz(params.id);
  const [step, setStep] = useState<number>(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  const [tempoPorQuestao, setTempoPorQuestao] = useState<Record<string, number>>({});
  const [tempoInicio, setTempoInicio] = useState<Date | null>(null);
  
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
  }, [quiz, tempoInicio]);

  // Atualizar o tempo por questão quando mudar de questão
  useEffect(() => {
    if (quiz && step < quiz.questoes.length && tempoInicio) {
      const questaoId = quiz.questoes[step]._id;
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
  }, [quiz, step, tempoInicio]);

  // Selecionar uma opção
  const selecionarOpcao = (questaoId: string, opcaoId: string) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: opcaoId
    }));
  };

  // Avançar para a próxima questão
  const avancar = () => {
    if (quiz && step < quiz.questoes.length - 1) {
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
      router.push(`/dashboard/quizzes/resultado/${params.id}`);
    } catch (error) {
      console.error("Erro ao enviar respostas:", error);
      setStatus(ApiStatus.ERROR);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-orange-800">Carregando quiz...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center text-orange-800">
            <h2 className="text-2xl font-bold mb-2">Quiz não encontrado</h2>
            <p className="mb-4">O quiz que você está procurando não existe ou foi removido.</p>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
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
              <CardTitle className="text-2xl text-orange-900">{quiz.titulo}</CardTitle>
              <CardDescription>{quiz.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-orange-900">Disciplina:</span>
                  <span>
                    {typeof quiz.avaliacao === 'string' 
                      ? 'Não especificada' 
                      : typeof quiz.avaliacao?.disciplina === 'string' 
                        ? 'Não especificada'
                        : quiz.avaliacao?.disciplina?.nome || 'Não especificada'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-orange-900">Número de questões:</span>
                  <span>{quiz.questoes.length}</span>
                </div>
                {quiz.tempoLimite && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-orange-900">Tempo limite:</span>
                    <span>{quiz.tempoLimite} minutos</span>
                  </div>
                )}
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <h3 className="font-medium text-orange-900 mb-2">Instruções:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-orange-800">
                  <li>Leia atentamente cada questão antes de responder.</li>
                  <li>Você pode navegar entre as questões usando os botões abaixo.</li>
                  <li>Uma vez finalizado, não será possível refazer este quiz.</li>
                  {quiz.tempoLimite && (
                    <li>O quiz tem um tempo limite de {quiz.tempoLimite} minutos.</li>
                  )}
                </ul>
              </div>
              
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => setStep(1)}
              >
                Iniciar Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Questão atual
  const questaoAtual = quiz.questoes[step - 1];
  const opcaoSelecionada = respostas[questaoAtual._id];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl text-orange-900">{quiz.titulo}</CardTitle>
              <div className="text-sm font-medium bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                Questão {step} de {quiz.questoes.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-orange-900 mb-3">{questaoAtual.enunciado}</h3>
              
              <div className="space-y-2 mt-4">
                {questaoAtual.opcoes.map((opcao) => (
                  <div 
                    key={opcao._id}
                    onClick={() => selecionarOpcao(questaoAtual._id, opcao._id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      opcaoSelecionada === opcao._id
                        ? 'bg-orange-200 border-orange-400 text-orange-900'
                        : 'bg-white border-orange-100 hover:bg-orange-50 text-orange-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        opcaoSelecionada === opcao._id
                          ? 'bg-orange-500 border-orange-500'
                          : 'border-orange-300'
                      }`}>
                        {opcaoSelecionada === opcao._id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span>{opcao.texto}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={voltar}
                disabled={step === 1}
              >
                Anterior
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={avancar}
                disabled={!opcaoSelecionada || status === ApiStatus.LOADING}
              >
                {status === ApiStatus.LOADING ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Enviando...
                  </>
                ) : step === quiz.questoes.length ? (
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
