"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Quiz } from '@/types/quiz';
import { EstudanteQuiz } from '@/types/estudanteQuiz';
import { ApiStatus } from '@/types/api';
import * as quizApi from '@/api/quiz';
import * as quizRespostaApi from '@/api/quizResposta';
import { QuizSearchParams } from '@/types/search';
import { QuizResposta } from '@/types/quizResposta';

type QuizContextType = {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  currentAttempt: EstudanteQuiz | null;
  status: ApiStatus;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  } | null;
  fetchQuizzes: (params: QuizSearchParams) => Promise<void>;
  fetchQuiz: (id: string) => Promise<void>;
  startAttempt: (quizId: string) => Promise<void>;
  submitAnswer: (questaoId: string, data: { opcaoSelecionadaId?: string, respostaTexto?: string }) => Promise<void>;
  finishAttempt: () => Promise<void>;
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<EstudanteQuiz | null>(null);
  const [status, setStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    total: number;
  } | null>(null);

  // Função para buscar quizzes com paginação
  const fetchQuizzes = async (params: QuizSearchParams) => {
    setStatus(ApiStatus.LOADING);
    setError(null);
    
    const response = await quizApi.getQuizzes(params);
    
    if (response.data) {
      setQuizzes(response.data);
      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total
        });
      }
      setStatus(ApiStatus.SUCCESS);
    } else {
      setError(response.error?.message || 'Erro ao buscar quizzes');
      setStatus(ApiStatus.ERROR);
    }
  };

  // Função para buscar um quiz específico
  const fetchQuiz = async (id: string) => {
    setStatus(ApiStatus.LOADING);
    setError(null);
    
    const response = await quizApi.getQuiz(id);
    
    if (response.data) {
      setCurrentQuiz(response.data);
      setStatus(ApiStatus.SUCCESS);
    } else {
      setError(response.error?.message || 'Erro ao buscar quiz');
      setStatus(ApiStatus.ERROR);
    }
  };
  // Função para iniciar uma tentativa
  const startAttempt = async (quizId: string) => {
    setStatus(ApiStatus.LOADING);
    setError(null);
    
    const response = await quizRespostaApi.iniciarQuiz(quizId);
    
    if (response.data) {
      setCurrentAttempt(response.data);
      setStatus(ApiStatus.SUCCESS);
    } else {
      setError(response.error?.message || 'Erro ao iniciar tentativa');
      setStatus(ApiStatus.ERROR);
    }
  };
  // Função para enviar resposta
  const submitAnswer = async (questaoId: string, data: { opcaoSelecionadaId?: string, respostaTexto?: string }) => {
    if (!currentAttempt) {
      setError('Nenhuma tentativa em andamento');
      return;
    }
    
    setStatus(ApiStatus.LOADING);
    setError(null);
    
    const response = await quizRespostaApi.registrarResposta(
      currentAttempt._id,
      questaoId,
      data
    );
    
    if (response.data) {
      // Refetch da tentativa atual para obter dados atualizados
      const tentativaResponse = await quizRespostaApi.getQuizEmAndamento(currentAttempt._id);
      if (tentativaResponse.data) {
        setCurrentAttempt(tentativaResponse.data);
      }
      setStatus(ApiStatus.SUCCESS);
    } else {
      setError(response.error?.message || 'Erro ao enviar resposta');
      setStatus(ApiStatus.ERROR);
    }
  };
  // Função para finalizar tentativa
  const finishAttempt = async () => {
    if (!currentAttempt) {
      setError('Nenhuma tentativa em andamento');
      return;
    }
    
    setStatus(ApiStatus.LOADING);
    setError(null);
    
    const response = await quizRespostaApi.finalizarQuiz(currentAttempt._id);
    
    if (response.data) {
      setCurrentAttempt(response.data);
      setStatus(ApiStatus.SUCCESS);
    } else {
      setError(response.error?.message || 'Erro ao finalizar tentativa');
      setStatus(ApiStatus.ERROR);
    }
  };

  return (
    <QuizContext.Provider value={{
      quizzes,
      currentQuiz,
      currentAttempt,
      status,
      error,
      pagination,
      fetchQuizzes,
      fetchQuiz,
      startAttempt,
      submitAnswer,
      finishAttempt
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
