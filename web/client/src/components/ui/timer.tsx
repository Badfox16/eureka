"use client";

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  startTime: Date;
  timeLimit?: number; // em minutos
  onTimeUp?: () => void;
}

export function Timer({ startTime, timeLimit, onTimeUp }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsed(elapsedSeconds);

      // Verificar se o tempo limite foi atingido
      if (timeLimit && elapsedSeconds >= timeLimit * 60) {
        setIsTimeUp(true);
        if (onTimeUp) {
          onTimeUp();
        }
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, timeLimit, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeRemaining = () => {
    if (!timeLimit) return null;
    const remaining = Math.max(0, (timeLimit * 60) - elapsed);
    return remaining;
  };

  const remaining = getTimeRemaining();
  const isWarning = remaining && remaining <= 300; // 5 minutos
  const isCritical = remaining && remaining <= 60; // 1 minuto

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      isCritical 
        ? 'bg-red-50 border-red-200 text-red-700' 
        : isWarning 
          ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
          : 'bg-primary-50 border-primary-200 text-primary-700'
    }`}>
      <Clock className="w-4 h-4" />
      <div className="text-sm font-medium">
        {timeLimit ? (
          <div className="flex flex-col">
            <span>Tempo restante: {remaining ? formatTime(remaining) : '00:00'}</span>
            <span className="text-xs opacity-75">Decorrido: {formatTime(elapsed)}</span>
          </div>
        ) : (
          <span>Tempo decorrido: {formatTime(elapsed)}</span>
        )}
      </div>
    </div>
  );
}
