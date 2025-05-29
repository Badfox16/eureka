"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  FlagIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from "lucide-react";
import { toast } from "sonner";

// Tipos
type Alternativa = {
  letra: string;
  texto: string;
  imagemUrl?: string;
};

type Questao = {
  _id: string;
  numero: number;
  enunciado: string;
  alternativas: Alternativa[];
  explicacao?: string;
  valor: number;
  imagemEnunciadoUrl?: string;
};

type Quiz = {
  _id: string;
  titulo: string;
  descricao?: string;
  disciplina: {
    nome: string;
    codigo: string;
  };
  tempoLimite: number; // em minutos
  questoes: Questao[];
};

// Componente principal
export default function QuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [estudanteQuizId, setEstudanteQuizId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quizConcluido, setQuizConcluido] = useState(false);
  
  // Dados simulados para desenvolvimento frontend
  useEffect(() => {
    // Em produção, isso seria substituído por uma chamada à API real
    const mockQuiz: Quiz = {
      _id: params.id,
      titulo: "Funções do Primeiro Grau - Matemática 10ª Classe",
      descricao: "Avaliação Provincial - 1º Trimestre",
      disciplina: {
        nome: "Matemática",
        codigo: "MAT"
      },
      tempoLimite: 30, // 30 minutos
      questoes: [
        {
          _id: "q1",
          numero: 1,
          enunciado: "Qual é a solução da equação 2x + 3 = 9?",
          alternativas: [
            { letra: "A", texto: "x = 2" },
            { letra: "B", texto: "x = 3" },
            { letra: "C", texto: "x = 4" },
            { letra: "D", texto: "x = 6" }
          ],
          valor: 1
        },
        {
          _id: "q2",
          numero: 2,
          enunciado: "Qual é o coeficiente angular da função f(x) = 3x - 7?",
          alternativas: [
            { letra: "A", texto: "-7" },
            { letra: "B", texto: "3" },
            { letra: "C", texto: "7" },
            { letra: "D", texto: "3x" }
          ],
          valor: 1
        },
        {
          _id: "q3",
          numero: 3,
          enunciado: "Uma função do primeiro grau é definida por f(x) = ax + b. Se f(2) = 5 e f(-1) = -4, qual é o valor de a?",
          alternativas: [
            { letra: "A", texto: "a = 2" },
            { letra: "B", texto: "a = 3" },
            { letra: "C", texto: "a = 4" },
            { letra: "D", texto: "a = 5" }
          ],
          valor: 1
        }
      ]
    };

    // Simular carregamento
    setTimeout(() => {
      setQuiz(mockQuiz);
      setTimeLeft(mockQuiz.tempoLimite * 60); // Converter para segundos
      setLoading(false);
      setEstudanteQuizId("mock-estudante-quiz-id-123");
    }, 1000);

    // Iniciar temporizador
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          finalizarQuizPorTempo();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Limpar temporizador quando componente for desmontado
    return () => clearInterval(timer);
  }, [params.id]);

  // Formatar tempo restante (mm:ss)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Selecionar resposta
  const handleSelectAnswer = (questaoId: string, letra: string) => {
    setAnswers((prev) => ({ ...prev, [questaoId]: letra }));
  };

  // Navegar para próxima questão
  const goToNextQuestion = () => {
    if (quiz && currentQuestion < quiz.questoes.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  // Navegar para questão anterior
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Salvar resposta atual no servidor
  const salvarResposta = async () => {
    if (!quiz || !estudanteQuizId) return;
    
    const questaoAtual = quiz.questoes[currentQuestion];
    const respostaEscolhida = answers[questaoAtual._id];
    
    if (!respostaEscolhida) return;
    
    setSubmitting(true);
    
    try {
      // Em produção, isso seria uma chamada à API real
      console.log("Salvando resposta:", {
        estudanteQuizId,
        questaoId: questaoAtual._id,
        respostaEscolhida,
        tempoResposta: 20 // Em segundos, em prod seria calculado
      });
      
      // Simular resposta do servidor
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("Resposta salva com sucesso");
      
      // Avançar para próxima questão automaticamente
      if (currentQuestion < quiz.questoes.length - 1) {
        goToNextQuestion();
      }
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
      toast.error("Erro ao salvar resposta");
    } finally {
      setSubmitting(false);
    }
  };

  // Finalizar quiz por tempo esgotado
  const finalizarQuizPorTempo = () => {
    toast.warning("Seu tempo acabou! O quiz será finalizado.");
    finalizarQuiz();
  };

  // Finalizar quiz
  const finalizarQuiz = async () => {
    if (!quiz || !estudanteQuizId) return;
    
    setSubmitting(true);
    
    try {
      // Verificar se todas as questões foram respondidas
      const totalQuestoes = quiz.questoes.length;
      const totalRespondidas = Object.keys(answers).length;
      
      if (totalRespondidas < totalQuestoes) {
        const confirmar = window.confirm(
          `Você respondeu apenas ${totalRespondidas} de ${totalQuestoes} questões. Deseja realmente finalizar o quiz?`
        );
        
        if (!confirmar) {
          setSubmitting(false);
          return;
        }
      }
      
      // Em produção, isso seria uma chamada à API real
      console.log("Finalizando quiz:", { estudanteQuizId });
      
      // Simular resposta do servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setQuizConcluido(true);
      toast.success("Quiz concluído com sucesso!");
      
      // Redirecionar para a página de resultados
      setTimeout(() => {
        router.push(`/dashboard/quizzes/${params.id}/resultado`);
      }, 1500);
    } catch (error) {
      console.error("Erro ao finalizar quiz:", error);
      toast.error("Erro ao finalizar quiz");
    } finally {
      setSubmitting(false);
    }
  };

  // Renderizar durante carregamento
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
        <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">
          Carregando quiz...
        </p>
      </div>
    );
  }

  // Renderizar quando quiz for concluído
  if (quizConcluido) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-200">
            Quiz concluído com sucesso!
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Redirecionando para seus resultados...
          </p>
        </div>
      </div>
    );
  }

  // Se quiz ainda não foi carregado
  if (!quiz) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <XCircleIcon className="h-16 w-16 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-200">
          Erro ao carregar quiz
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Não foi possível carregar o quiz solicitado.
        </p>
        <Button 
          onClick={() => router.push('/dashboard/quizzes')}
          className="mt-4"
        >
          Voltar para a lista de quizzes
        </Button>
      </div>
    );
  }

  // Dados da questão atual
  const questao = quiz.questoes[currentQuestion];
  const selectedAnswer = answers[questao._id] || "";
  const isAnswered = !!selectedAnswer;
  const totalQuestions = quiz.questoes.length;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Eureka Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-primary-600">Eureka</span>
            </Link>
            <span className="ml-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              {quiz.titulo}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className={`text-sm font-medium ${
                timeLeft < 300 ? "text-red-500 animate-pulse" : "text-slate-700 dark:text-slate-300"
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={finalizarQuiz}
              disabled={submitting}
            >
              <FlagIcon className="mr-1.5 h-3.5 w-3.5" />
              Terminar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto flex-1 px-4 py-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {quiz.questoes.map((q, index) => (
            <button
              key={q._id}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                answers[q._id]
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              } ${
                index === currentQuestion
                  ? "ring-2 ring-primary-600 ring-offset-2 dark:ring-offset-slate-900"
                  : ""
              }`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Questão {currentQuestion + 1} de {totalQuestions}</span>
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                {questao.valor} {questao.valor > 1 ? 'pontos' : 'ponto'}
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <p className="mb-6 text-base">{questao.enunciado}</p>
            
            {questao.imagemEnunciadoUrl && (
              <div className="mb-6 flex justify-center">
                <Image
                  src={questao.imagemEnunciadoUrl}
                  alt="Imagem da questão"
                  width={500}
                  height={300}
                  className="rounded-md max-h-[300px] object-contain"
                />
              </div>
            )}
            
            <div className="space-y-3">
              {questao.alternativas.map((option) => (
                <div
                  key={option.letra}
                  className={`cursor-pointer rounded-md border p-3.5 ${
                    selectedAnswer === option.letra
                      ? "border-primary-600 bg-primary-50 dark:border-primary-500 dark:bg-primary-950"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                  onClick={() => handleSelectAnswer(questao._id, option.letra)}
                >
                  <div className="flex items-start gap-2">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      selectedAnswer === option.letra
                        ? "border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-600"
                        : "border-slate-300 dark:border-slate-600"
                    }`}>
                      {option.letra}
                    </div>
                    <div className="text-sm">
                      {option.texto}
                      {option.imagemUrl && (
                        <div className="mt-2">
                          <Image
                            src={option.imagemUrl}
                            alt={`Alternativa ${option.letra}`}
                            width={400}
                            height={200}
                            className="rounded-md max-h-[200px] object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={goToNextQuestion}
              disabled={currentQuestion === totalQuestions - 1}
            >
              Próxima
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <div className="flex justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Respondidas: {Object.keys(answers).length} de {totalQuestions}
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              className="bg-primary-600 hover:bg-primary-700"
              disabled={!isAnswered || submitting}
              onClick={salvarResposta}
            >
              {submitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Salvando...
                </>
              ) : (
                "Salvar Resposta"
              )}
            </Button>
            <Button
              variant="outline"
              className="border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-500 dark:text-primary-400"
              disabled={Object.keys(answers).length === 0 || submitting}
              onClick={finalizarQuiz}
            >
              Concluir Quiz
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}