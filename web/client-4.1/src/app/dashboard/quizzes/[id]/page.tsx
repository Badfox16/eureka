"use client";

import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer } from "@/components/ui/timer";
import { QuestionPagination } from "@/components/ui/question-pagination";
import { QuizProgress } from "@/components/ui/quiz-progress";
import { ErrorAlert } from "@/components/ui/error-alert";
import { useQuiz } from "@/hooks/useQuizzes";
import { useParams, useRouter } from "next/navigation";
import { ApiStatus } from "@/types/api";
import { useAuth } from "@/contexts/AuthContext";
import { useQuizResposta } from "@/hooks/useQuizResposta";
import { AlertCircle, Clock, Users } from "lucide-react";
import React from "react";
import { DebugUserInfo } from "@/components/debug/DebugUserInfo";
import { TestApiEndpoint } from "@/components/debug/TestApiEndpoint";

export default function QuizPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { usuario } = useAuth();
  const router = useRouter();
  const { quiz, isLoading } = useQuiz(id);  // Estado para a tentativa de quiz
  const [estudanteQuizId, setEstudanteQuizId] = useState<string>();
    // Hook para acessar tentativa em andamento
  const { 
    tentativaAtual,
    iniciarQuiz, 
    submeterRespostas, 
    isStarting, 
    isSubmitting,
    isLoading: isTentativaLoading
  } = useQuizResposta(estudanteQuizId);

  const [step, setStep] = useState<number>(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});  const [status, setStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  const [tempoInicio, setTempoInicio] = useState<Date | null>(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carregar estado da tentativa em andamento quando tentativaAtual mudar
  useEffect(() => {
    if (tentativaAtual && estudanteQuizId) {
      console.log('Carregando estado da tentativa atual:', tentativaAtual);
      
      // Se a tentativa foi finalizada, redirecionar para resultado
      if (tentativaAtual.dataFim) {
        router.push(`/dashboard/quizzes/resultado/${estudanteQuizId}`);
        return;
      }
      
      // Se há dados da tentativa em andamento no formato do backend
      if ((tentativaAtual as any).progresso && (tentativaAtual as any).questoesRespondidas) {
        const tentativaData = tentativaAtual as any;
        
        // Criar mapa de respostas baseado nas questões respondidas
        const respostasMap: Record<string, string> = {};
        tentativaData.questoesRespondidas.forEach((resp: any) => {
          respostasMap[resp.id] = resp.respostaEscolhida;
        });
        
        setRespostas(respostasMap);
        
        // Definir a questão atual (primeira pendente ou última respondida + 1)
        const totalRespondidas = tentativaData.progresso.respondidas;
        const proximaQuestao = Math.min(totalRespondidas + 1, getQuestoes().length);
        setStep(proximaQuestao);
        
        // Definir tempo de início
        if (tentativaData.tentativa && tentativaData.tentativa.dataInicio) {
          setTempoInicio(new Date(tentativaData.tentativa.dataInicio));
        }
        
        setStatus(ApiStatus.SUCCESS);
        console.log('Estado da tentativa carregado:', {
          respostas: Object.keys(respostasMap).length,
          step: proximaQuestao,
          totalRespondidas
        });
      }
    }
  }, [tentativaAtual, estudanteQuizId, router]);

  // Verificar se há tentativa em andamento quando o componente carrega
  useEffect(() => {
    const verificarTentativaEmAndamento = async () => {
      if (!usuario || !quiz) return;
        // Buscar tentativa em andamento para este usuário e quiz
      // Obter estudanteId do localStorage ou do usuário atual
      let estudanteId = usuario._id;
      const userData = localStorage.getItem('user_data');
      
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          estudanteId = parsedData._id || usuario._id;
        } catch (e) {
          console.warn('Erro ao parsear dados do usuário:', e);
        }
      }
      
      console.log('Verificando tentativa em andamento para:', { estudanteId, quizId: quiz._id });
      
      // Verificar se há dados salvos no localStorage
      const tentativaKey = `tentativa_${quiz._id}_${estudanteId}`;
      const tentativaSalva = localStorage.getItem(tentativaKey);
      
      if (tentativaSalva) {
        try {
          const dados = JSON.parse(tentativaSalva);
          console.log('Tentativa em andamento encontrada:', dados);
          
          setEstudanteQuizId(dados.estudanteQuizId);
          setRespostas(dados.respostas || {});
          setStep(dados.step || 1);
          setTempoInicio(dados.tempoInicio ? new Date(dados.tempoInicio) : new Date());
          setStatus(ApiStatus.SUCCESS);
        } catch (error) {
          console.error('Erro ao recuperar tentativa salva:', error);
          localStorage.removeItem(tentativaKey);
        }
      }
    };

    verificarTentativaEmAndamento();
  }, [usuario, quiz]);  // Salvar progresso no localStorage sempre que houver mudanças
  useEffect(() => {
    if (!usuario || !quiz || !estudanteQuizId || step === 0) return;
    
    let estudanteId = null;
    const userData = localStorage.getItem('user_data');
    
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        estudanteId = parsedData.estudanteId || parsedData.estudante?._id;
      } catch (e) {
        console.warn('Erro ao parsear dados do usuário:', e);
        estudanteId = usuario._id; // fallback
      }
    } else {
      estudanteId = usuario._id; // fallback
    }
    
    const tentativaKey = `tentativa_${quiz._id}_${estudanteId}`;
    
    const dadosParaSalvar = {
      estudanteQuizId,
      respostas,
      step,
      tempoInicio: tempoInicio?.toISOString(),
      quizId: quiz._id,
      ultimaAtualizacao: new Date().toISOString()
    };
    
    localStorage.setItem(tentativaKey, JSON.stringify(dadosParaSalvar));
  }, [estudanteQuizId, respostas, step, tempoInicio, usuario, quiz]);

  // Getter para acessar as questões
  const getQuestoes = () => {
    if (!quiz || !quiz.avaliacao?.questoes) return [];
    return quiz.avaliacao.questoes;
  };

  // Calcular questões respondidas
  const questoesRespondidas = useMemo(() => {
    const questoes = getQuestoes();
    return new Set(Object.keys(respostas).filter(questaoId => 
      questoes.find(q => q._id === questaoId)
    ));
  }, [respostas, quiz]);

  // Calcular tempo decorrido
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  
  useEffect(() => {
    if (!tempoInicio) return;
    
    const interval = setInterval(() => {
      const agora = new Date();
      const decorrido = Math.floor((agora.getTime() - tempoInicio.getTime()) / 1000);
      setTempoDecorrido(decorrido);
    }, 1000);

    return () => clearInterval(interval);
  }, [tempoInicio]);  // Selecionar uma opção e registrar a resposta
  const selecionarOpcao = async (questaoId: string, opcaoId: string) => {
    // Atualizar estado local
    setRespostas(prev => ({
      ...prev,
      [questaoId]: opcaoId
    }));
    
    // Se há estudanteQuizId, registrar a resposta no backend
    if (estudanteQuizId) {
      try {
        console.log('Registrando resposta...', { 
          estudanteQuizId, 
          questaoId, 
          opcaoSelecionada: opcaoId 
        });
        
        // Encontrar a alternativa selecionada para obter a letra
        const questaoAtual = getQuestoes().find(q => q._id === questaoId);
        const alternativaSelecionada = questaoAtual?.alternativas.find(alt => alt._id === opcaoId);
        
        if (!alternativaSelecionada) {
          console.error('Alternativa selecionada não encontrada:', { questaoId, opcaoId });
          return;
        }
        
        // Calcular tempo de resposta para esta questão específica
        const agora = new Date();
        const tempoResposta = tempoInicio ? Math.floor((agora.getTime() - tempoInicio.getTime()) / 1000) : 0;
        
        // Registrar resposta no backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.eureka.edu.br'}/api/v1/quiz-respostas/resposta`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            estudanteQuizId,
            questaoId,
            respostaEscolhida: alternativaSelecionada.letra,
            tempoResposta
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Resposta registrada com sucesso:', result);
          
          // Pode mostrar feedback visual se a resposta estava correta
          if (result.data && typeof result.data.estaCorreta === 'boolean') {
            // Aqui você pode adicionar feedback visual se desejar
            console.log('Resposta está correta:', result.data.estaCorreta);
          }
        } else {
          console.error('Erro ao registrar resposta:', response.status, response.statusText);
        }
        
      } catch (error) {
        console.error('Erro ao registrar resposta:', error);
        // Não mostrar erro para o usuário pois a resposta foi salva localmente
        // Apenas log para debug
      }
    }
  };

  // Navegar para uma questão específica
  const irParaQuestao = (numeroQuestao: number) => {
    setStep(numeroQuestao);
  };

  // Avançar para a próxima questão
  const avancar = () => {
    const questoes = getQuestoes();
    if (step < questoes.length) {
      setStep(step + 1);
    } else {
      setShowConfirmFinish(true);
    }
  };

  // Voltar para a questão anterior
  const voltar = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // Finalizar o quiz quando o tempo acabar
  const handleTimeUp = () => {
    setShowConfirmFinish(true);
  };  // Iniciar uma nova tentativa de quiz
  const handleIniciarQuiz = async () => {
    if (!quiz || !usuario) {
      console.error('Quiz ou usuário não disponível:', { quiz: !!quiz, usuario: !!usuario });
      return;
    }
    
    try {
      console.log('=== DEBUG: handleIniciarQuiz ===');
      console.log('Quiz ID:', quiz._id);
      console.log('Usuario completo:', usuario);
      console.log('Tipo do usuario:', typeof usuario);
      console.log('localStorage auth_token:', !!localStorage.getItem('auth_token'));
      console.log('localStorage user_data:', localStorage.getItem('user_data'));
      console.log('====================================');
      
      const response = await iniciarQuiz(quiz._id);
      console.log('=== DEBUG: Resposta do iniciarQuiz ===');
      console.log('Response completa:', response);
      console.log('Response.data existe:', !!response?.data);
      console.log('=====================================');
        if (response && response.data) {
        console.log('Quiz iniciado com sucesso, dados:', response.data);
        
        // O backend pode retornar uma tentativa existente ou nova
        const tentativa = response.data.tentativa || response.data;
        
        if (tentativa && tentativa._id) {
          setEstudanteQuizId(tentativa._id);
          
          // Se há questões pendentes e total de respondidas, significa tentativa em andamento
          if (response.data.questoesPendentes && typeof response.data.totalRespondidas === 'number') {
            console.log('Recuperando tentativa em andamento:', {
              totalRespondidas: response.data.totalRespondidas,
              totalQuestoes: response.data.totalQuestoes,
              questoesPendentes: response.data.questoesPendentes?.length
            });
              // Navegar para a primeira questão não respondida
            const proximaQuestao = response.data.totalRespondidas + 1;
            const questoes = getQuestoes();
            setStep(Math.min(proximaQuestao, questoes.length));
          } else {
            // Nova tentativa
            setStep(1);
          }
          
          setTempoInicio(tentativa.dataInicio ? new Date(tentativa.dataInicio) : new Date());
          setStatus(ApiStatus.SUCCESS);
          
          // Limpar mensagens de erro
          setErrorMessage(null);
          
        } else {
          setStatus(ApiStatus.ERROR);
          setErrorMessage("Resposta do servidor inválida");
          console.error("Tentativa não encontrada na resposta:", response.data);
        }
      } else {
        setStatus(ApiStatus.ERROR);
        setErrorMessage("Falha ao iniciar quiz - resposta vazia do servidor");
        console.error("Falha ao iniciar a tentativa de quiz - resposta sem dados:", response);
      }    } catch (error) {
      setStatus(ApiStatus.ERROR);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido ao iniciar quiz';
      setErrorMessage(errorMsg);
      
      console.error("Erro completo ao iniciar quiz:", {
        error,
        message: errorMsg,
        stack: error instanceof Error ? error.stack : undefined,
        errorObject: JSON.stringify(error, null, 2)
      });
    }
  };
  // Finalizar o quiz e submeter as respostas
  const finalizarQuiz = async () => {
    if (!quiz || !estudanteQuizId || !tempoInicio) return;

    try {
      setStatus(ApiStatus.LOADING);
      
      // O backend espera que finalizemos a tentativa diretamente
      // As respostas já foram registradas individualmente (se implementado) ou serão enviadas aqui
      console.log('Finalizando quiz...', { 
        estudanteQuizId, 
        questoesRespondidas: questoesRespondidas.size,
        totalQuestoes: getQuestoes().length 
      });
      
      // Use a API de finalizar quiz do backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.eureka.edu.br'}/api/v1/quiz-respostas/${estudanteQuizId}/finalizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao finalizar quiz: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Quiz finalizado com sucesso:', result);      // Limpar dados salvos no localStorage
      if (usuario) {
        let estudanteId = null;
        const userData = localStorage.getItem('user_data');
        
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            estudanteId = parsedData.estudanteId || parsedData.estudante?._id;
          } catch (e) {
            console.warn('Erro ao parsear dados do usuário:', e);
            estudanteId = usuario._id; // fallback
          }
        } else {
          estudanteId = usuario._id; // fallback
        }
        
        const tentativaKey = `tentativa_${quiz._id}_${estudanteId}`;
        localStorage.removeItem(tentativaKey);
      }
      
      // Redirecionar para a página de resultado
      router.push(`/dashboard/quizzes/resultado/${estudanteQuizId}`);
      
    } catch (error) {
      console.error("Erro ao finalizar quiz:", error);
      setStatus(ApiStatus.ERROR);
      const errorMsg = error instanceof Error ? error.message : 'Erro ao finalizar quiz';
      setErrorMessage(errorMsg);
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
    return (      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <DebugUserInfo />
          <TestApiEndpoint />
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-primary-900">{quiz.titulo}</CardTitle>
              <CardDescription>{quiz.descricao}</CardDescription>
            </CardHeader>            <CardContent className="space-y-6">
              {errorMessage && (
                <ErrorAlert
                  message={errorMessage}
                  onClose={() => setErrorMessage(null)}
                  onRetry={handleIniciarQuiz}
                />
              )}
                <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary-900">Disciplina:</span>
                  <span>
                    {typeof quiz.avaliacao === 'string' 
                      ? 'Não especificada' 
                      : typeof quiz.avaliacao?.disciplina === 'string' 
                        ? 'Não especificada'
                        : quiz.avaliacao?.disciplina?.nome 
                          ? `${quiz.avaliacao.disciplina.nome} (${quiz.avaliacao.disciplina.codigo || 'N/A'})`
                          : 'Não especificada'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary-900">Avaliação:</span>
                  <span>
                    {typeof quiz.avaliacao === 'string' 
                      ? 'Não especificada' 
                      : `${quiz.avaliacao?.tipo || 'N/A'} - ${quiz.avaliacao?.classe || 'N/A'}ª Classe`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-primary-900">Número de questões:</span>
                  <span>{getQuestoes().length}</span>
                </div>
                
                {/* Calcular pontuação total possível */}
                {(() => {
                  const questoes = getQuestoes();
                  const pontuacaoTotal = questoes.reduce((total, q) => total + (q.valor || 1), 0);
                  return pontuacaoTotal > questoes.length ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary-900">Pontuação total:</span>
                      <span>{pontuacaoTotal} pontos</span>
                    </div>
                  ) : null;
                })()}
                
                {quiz.tempoLimite && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary-900">Tempo limite:</span>
                    <span>{quiz.tempoLimite} minutos</span>
                  </div>
                )}
                
                {typeof quiz.avaliacao !== 'string' && quiz.avaliacao?.ano && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary-900">Ano:</span>
                    <span>{quiz.avaliacao.ano}</span>
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
                onClick={handleIniciarQuiz}
                disabled={isStarting}
              >
                {isStarting ? 'Iniciando...' : 'Iniciar Quiz'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );  }  // Renderização principal do quiz
  if (!quiz || getQuestoes().length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-center text-primary-800">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-primary-400" />
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
  // Questão atual
  const questoes = getQuestoes();
  const questaoAtual = step > 0 && step <= questoes.length ? questoes[step - 1] : null;
  const opcaoSelecionada = questaoAtual ? respostas[questaoAtual._id] : undefined;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header com timer e progresso */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tempoInicio && (
            <Timer 
              startTime={tempoInicio}
              timeLimit={quiz.tempoLimite}
              onTimeUp={handleTimeUp}
            />
          )}
          <QuizProgress
            totalQuestions={questoes.length}
            answeredQuestions={questoesRespondidas.size}
            currentQuestion={step}
            timeElapsed={tempoDecorrido}
            timeLimit={quiz.tempoLimite}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar com navegação */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navegação</CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionPagination
                  currentStep={step}
                  totalQuestions={questoes.length}
                  answeredQuestions={questoesRespondidas}
                  questionsData={questoes}
                  onStepChange={irParaQuestao}
                />
              </CardContent>
            </Card>
          </div>

          {/* Área principal da questão */}
          <div className="lg:col-span-3">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl text-primary-900">{quiz.titulo}</CardTitle>
                  <div className="text-sm font-medium bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
                    Questão {step} de {questoes.length}
                  </div>
                </div>
              </CardHeader>              <CardContent className="space-y-6">
                {questaoAtual ? (
                  <>                    <div className="bg-primary-50 p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-primary-900 flex-1">
                          <span className="text-primary-600 font-semibold">
                            {questaoAtual.numero ? `${questaoAtual.numero}. ` : `${step}. `}
                          </span>
                          {questaoAtual.enunciado}
                        </h3>
                        {questaoAtual.valor && (
                          <div className="ml-4 bg-primary-200 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                            {questaoAtual.valor} pts
                          </div>
                        )}
                      </div>
                      
                      {/* Imagem da questão, se houver */}
                      {(questaoAtual as any).imagemEnunciadoUrl && (
                        <div className="mb-6">
                          <img 
                            src={(questaoAtual as any).imagemEnunciadoUrl} 
                            alt="Imagem da questão"
                            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                            onError={(e) => {
                              console.error('Erro ao carregar imagem da questão:', (questaoAtual as any).imagemEnunciadoUrl);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-3 mt-6">
                        {questaoAtual.alternativas && questaoAtual.alternativas.map((alternativa) => (
                          <div
                            key={alternativa._id}
                            onClick={() => selecionarOpcao(questaoAtual._id, alternativa._id)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                              opcaoSelecionada === alternativa._id
                                ? 'bg-primary-100 border-primary-400 text-primary-900 shadow-md'
                                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 mt-1 ${
                                opcaoSelecionada === alternativa._id
                                  ? 'bg-primary-500 border-primary-500'
                                  : 'border-gray-300'
                              }`}>
                                {opcaoSelecionada === alternativa._id && (
                                  <div className="w-3 h-3 bg-white rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-sm">{alternativa.letra}.</span>
                                  <span className="flex-1">{alternativa.texto}</span>
                                </div>
                                {/* Imagem da alternativa, se houver */}
                                {(alternativa as any).imagemUrl && (
                                  <div className="mt-3">
                                    <img 
                                      src={(alternativa as any).imagemUrl} 
                                      alt={`Alternativa ${alternativa.letra}`}
                                      className="max-w-full h-auto rounded border border-gray-200 shadow-sm max-h-40"
                                      onError={(e) => {
                                        console.error('Erro ao carregar imagem da alternativa:', (alternativa as any).imagemUrl);
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Navegação entre questões */}
                    <div className="flex justify-between items-center pt-4">
                      <Button 
                        variant="outline" 
                        onClick={voltar}
                        disabled={step <= 1}
                        className="flex items-center gap-2"
                      >
                        ← Anterior
                      </Button>
                      
                      <div className="flex gap-2">
                        {step === questoes.length ? (
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                            onClick={() => setShowConfirmFinish(true)}
                            disabled={questoesRespondidas.size === 0}
                          >
                            Finalizar Quiz
                          </Button>
                        ) : (
                          <Button 
                            className="bg-primary-500 hover:bg-primary-600 text-white flex items-center gap-2"
                            onClick={avancar}
                          >
                            Próxima →
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Questão não encontrada. Por favor, tente novamente.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de confirmação para finalizar */}
        {showConfirmFinish && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-xl">Finalizar Quiz</CardTitle>
              </CardHeader>              <CardContent className="space-y-4">
                <div className="text-gray-600">
                  <p>Você respondeu <strong>{questoesRespondidas.size}</strong> de <strong>{questoes.length}</strong> questões.</p>
                  
                  {/* Mostrar pontuação estimada se as questões têm valores diferentes */}
                  {(() => {
                    const questoesComValor = questoes.filter(q => q.valor && q.valor > 1);
                    if (questoesComValor.length > 0) {
                      const pontuacaoMaxima = questoes.reduce((total, q) => total + (q.valor || 1), 0);
                      const pontuacaoAtual = questoes
                        .filter(q => respostas[q._id])
                        .reduce((total, q) => total + (q.valor || 1), 0);
                      
                      return (
                        <p className="text-sm text-gray-500 mt-1">
                          Pontuação possível das questões respondidas: <strong>{pontuacaoAtual}</strong> de <strong>{pontuacaoMaxima}</strong> pontos
                        </p>
                      );
                    }
                    return null;
                  })()}
                  
                  {questoesRespondidas.size < questoes.length && (
                    <p className="text-yellow-600 mt-2">
                      ⚠️ Ainda há <strong>{questoes.length - questoesRespondidas.size}</strong> questões não respondidas. Tem certeza que deseja finalizar?
                    </p>
                  )}
                  
                  {/* Mostrar tempo decorrido */}
                  {tempoDecorrido > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Tempo decorrido: <strong>{Math.floor(tempoDecorrido / 60)}:{(tempoDecorrido % 60).toString().padStart(2, '0')}</strong>
                      {quiz.tempoLimite && (
                        <span> de {quiz.tempoLimite} minutos</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfirmFinish(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={finalizarQuiz}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Finalizando...' : 'Confirmar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
