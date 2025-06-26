"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuestionPaginationProps {
  currentStep: number;
  totalQuestions: number;
  answeredQuestions: Set<string>;
  questionsData: Array<{ _id: string; numero?: number }>;
  onStepChange: (step: number) => void;
}

export function QuestionPagination({ 
  currentStep, 
  totalQuestions, 
  answeredQuestions, 
  questionsData,
  onStepChange 
}: QuestionPaginationProps) {
  const goToPrevious = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const goToNext = () => {
    if (currentStep < totalQuestions) {
      onStepChange(currentStep + 1);
    }
  };

  const goToQuestion = (questionNumber: number) => {
    onStepChange(questionNumber);
  };

  return (
    <div className="space-y-4">
      {/* Grid de questões */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const questionNumber = index + 1;
          const questionId = questionsData[index]?._id;
          const isAnswered = questionId && answeredQuestions.has(questionId);
          const isCurrent = questionNumber === currentStep;
          
          return (
            <button
              key={questionNumber}
              onClick={() => goToQuestion(questionNumber)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                isCurrent
                  ? 'bg-primary-600 text-white'
                  : isAnswered
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
              title={`Questão ${questionNumber}${isAnswered ? ' (respondida)' : ''}`}
            >
              {questionNumber}
            </button>
          );
        })}
      </div>

      {/* Navegação anterior/próxima */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={goToPrevious}
          disabled={currentStep <= 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        
        <span className="text-sm text-gray-600">
          {currentStep} de {totalQuestions}
        </span>
        
        <Button 
          variant="outline" 
          onClick={goToNext}
          disabled={currentStep >= totalQuestions}
          className="flex items-center gap-2"
        >
          Próxima
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
