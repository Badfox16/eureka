"use client";

import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface QuizProgressProps {
  totalQuestions: number;
  answeredQuestions: number;
  currentQuestion: number;
  timeElapsed?: number;
  timeLimit?: number;
}

export function QuizProgress({ 
  totalQuestions, 
  answeredQuestions, 
  currentQuestion,
  timeElapsed,
  timeLimit 
}: QuizProgressProps) {
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Progresso do Quiz</h3>
        {timeElapsed !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeElapsed)}</span>
            {timeLimit && (
              <span className="text-gray-400">/ {formatTime(timeLimit * 60)}</span>
            )}
          </div>
        )}
      </div>
      
      {/* Barra de progresso */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Questões respondidas</span>
          <span className="font-medium">{answeredQuestions} de {totalQuestions}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="text-xs text-gray-500 text-center">
          {progressPercentage.toFixed(0)}% concluído
        </div>
      </div>

      {/* Status das questões */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span>{answeredQuestions} respondidas</span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-gray-400" />
          <span>{totalQuestions - answeredQuestions} pendentes</span>
        </div>
      </div>

      {/* Questão atual */}
      <div className="pt-2 border-t">
        <div className="text-sm text-gray-600">
          Questão atual: <span className="font-medium">{currentQuestion}</span>
        </div>
      </div>
    </div>
  );
}
