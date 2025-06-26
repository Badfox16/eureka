"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TestResultadoApi() {
  const [estudanteQuizId, setEstudanteQuizId] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testarApi = async () => {
    if (!estudanteQuizId.trim()) {
      setError("Por favor, insira um ID de estudante quiz");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.eureka.edu.br';
      
      // Teste direto da API de resultado
      console.log(`Testando API: ${apiUrl}/api/v1/quiz-respostas/${estudanteQuizId}`);
      
      const response = await fetch(`${apiUrl}/api/v1/quiz-respostas/${estudanteQuizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      setResultado(data);

    } catch (err) {
      console.error('Erro ao testar API:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const testarAndamento = async () => {
    if (!estudanteQuizId.trim()) {
      setError("Por favor, insira um ID de estudante quiz");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.eureka.edu.br';
      
      // Teste da API de andamento
      console.log(`Testando API: ${apiUrl}/api/v1/quiz-respostas/${estudanteQuizId}/andamento`);
      
      const response = await fetch(`${apiUrl}/api/v1/quiz-respostas/${estudanteQuizId}/andamento`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data (andamento):', data);
      setResultado(data);

    } catch (err) {
      console.error('Erro ao testar API de andamento:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-blue-800">Debug - Testar API de Resultado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">ID do EstudanteQuiz:</label>
          <Input
            value={estudanteQuizId}
            onChange={(e) => setEstudanteQuizId(e.target.value)}
            placeholder="Cole o ID aqui (ex: 68575e2c5dd1cca1df8377b4)"
            className="mb-2"
          />
          <div className="flex gap-2">
            <Button 
              onClick={testarApi} 
              disabled={loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Testando...' : 'Testar API de Resultado'}
            </Button>
            <Button 
              onClick={testarAndamento} 
              disabled={loading}
              size="sm"
              variant="outline"
            >
              {loading ? 'Testando...' : 'Testar API de Andamento'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-2 rounded text-sm">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {resultado && (
          <div>
            <strong>Resultado da API:</strong>
            <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-64 border">
              {JSON.stringify(resultado, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
