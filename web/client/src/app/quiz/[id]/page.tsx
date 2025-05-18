"use client";

import { useState } from "react";
import { Button } from "@/components/ui/card";
import { ArrowLeftIcon, ArrowRightIcon, FlagIcon, ClockIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Dados simulados de um quiz
const quizData = {
  id: "math-101",
  title: "Funções do Primeiro Grau",
  subject: "Matemática",
  questions: [
    {
      id: 1,
      text: "Qual é a solução da equação 2x + 3 = 9?",
      options: [
        { id: "a", text: "x = 2" },
        { id: "b", text: "x = 3" },
        { id: "c", text: "x = 4" },
        { id: "d", text: "x = 6" },
      ],
      correctAnswer: "b",
    },
    {
      id: 2,
      text: "Para a função f(x) = 3x - 5, qual é o valor de f(2)?",
      options: [
        { id: "a", text: "1" },
        { id: "b", text: "-1" },
        { id: "c", text: "6" },
        { id: "d", text: "11" },
      ],
      correctAnswer: "a",
    },
    {
      id: 3,
      text: "Se uma reta no plano cartesiano passa pelos pontos (0,4) e (2,8), qual é a sua inclinação?",
      options: [
        { id: "a", text: "1" },
        { id: "b", text: "2" },
        { id: "c", text: "3" },
        { id: "d", text: "4" },
      ],
      correctAnswer: "b",
    },
    {
      id: 4,
      text: "Qual é a forma geral de uma função do primeiro grau?",
      options: [
        { id: "a", text: "f(x) = ax² + bx + c" },
        { id: "b", text: "f(x) = ax + b" },
        { id: "c", text: "f(x) = a/x + b" },
        { id: "d", text: "f(x) = a^x + b" },
      ],
      correctAnswer: "b",
    },
    {
      id: 5,
      text: "O que representa o coeficiente 'a' na função f(x) = ax + b?",
      options: [
        { id: "a", text: "O ponto onde a reta cruza o eixo y" },
        { id: "b", text: "O ponto onde a reta cruza o eixo x" },
        { id: "c", text: "A inclinação da reta" },
        { id: "d", text: "A curvatura da função" },
      ],
      correctAnswer: "c",
    },
  ],
};

export default function QuizPage({ params }: { params: { id: string } }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutos em segundos
  
  const totalQuestions = quizData.questions.length;
  const question = quizData.questions[currentQuestion];
  
  const handleSelectAnswer = (optionId: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
  };
  
  const goToNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };
  
  const selectedAnswer = answers[question.id] || "";
  const isAnswered = !!selectedAnswer;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{quizData.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {quizData.subject}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
            </div>
            <Button variant="outline" size="sm">
              <FlagIcon className="mr-1.5 h-3.5 w-3.5" />
              Terminar
            </Button>
          </div>
        </header>
        
        <div className="mb-6 flex flex-wrap gap-2">
          {quizData.questions.map((q, index) => (
            <button
              key={q.id}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                answers[q.id]
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
            <CardTitle className="text-lg">
              Questão {currentQuestion + 1} de {totalQuestions}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-base">{question.text}</p>
            
            <div className="space-y-3">
              {question.options.map((option) => (
                <div
                  key={option.id}
                  className={`cursor-pointer rounded-md border p-3.5 ${
                    selectedAnswer === option.id
                      ? "border-primary-600 bg-primary-50 dark:border-primary-500 dark:bg-primary-950"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                  onClick={() => handleSelectAnswer(option.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-sm font-medium ${
                        selectedAnswer === option.id
                          ? "border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {option.id.toUpperCase()}
                    </div>
                    <div>{option.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <Button
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
          <Button
            variant="default"
            className="bg-primary-600 hover:bg-primary-700"
            disabled={Object.keys(answers).length < totalQuestions}
          >
            Concluir Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}