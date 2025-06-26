"use client";

import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onClose?: () => void;
  onRetry?: () => void;
}

export function ErrorAlert({ title = "Erro", message, onClose, onRetry }: ErrorAlertProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {(onRetry || onClose) && (
            <div className="mt-4 flex gap-2">
              {onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Tentar novamente
                </Button>
              )}
              {onClose && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="text-red-700 hover:bg-red-100"
                >
                  Fechar
                </Button>
              )}
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
