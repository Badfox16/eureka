"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PerfilForm } from "@/components/forms/PerfilForm";
import AlterarSenhaForm from "@/components/forms/AlterarSenhaForm";
import { useEstudante } from "@/hooks/useEstudante";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { ApiStatus } from "@/types/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProvinciaSelect } from "@/types/provincia";

export default function PerfilPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const { estudante, isLoading, updatePerfil } = useEstudante().usePerfilEstudante();
  const { alterarSenha } = useAuth();
  const [perfilStatus, setPerfilStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  const [senhaStatus, setSenhaStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  const [perfilError, setPerfilError] = useState<string | null>(null);
  const [senhaError, setSenhaError] = useState<string | null>(null);
  
  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!usuario) {
      router.push('/login');
    }
  }, [usuario, router]);

  // Lista de províncias de Angola
  const provincias: ProvinciaSelect[] = [
    { _id: "bengo", nome: "Bengo" },
    { _id: "benguela", nome: "Benguela" },
    { _id: "bie", nome: "Bié" },
    { _id: "cabinda", nome: "Cabinda" },
    { _id: "cuando_cubango", nome: "Cuando Cubango" },
    { _id: "cuanza_norte", nome: "Cuanza Norte" },
    { _id: "cuanza_sul", nome: "Cuanza Sul" },
    { _id: "cunene", nome: "Cunene" },
    { _id: "huambo", nome: "Huambo" },
    { _id: "huila", nome: "Huíla" },
    { _id: "luanda", nome: "Luanda" },
    { _id: "lunda_norte", nome: "Lunda Norte" },
    { _id: "lunda_sul", nome: "Lunda Sul" },
    { _id: "malanje", nome: "Malanje" },
    { _id: "moxico", nome: "Moxico" },
    { _id: "namibe", nome: "Namibe" },
    { _id: "uige", nome: "Uíge" },
    { _id: "zaire", nome: "Zaire" }
  ];
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-primary-700">Carregando seu perfil...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Verificar se o usuário é um estudante
  if (!estudante) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">          <div className="p-6 bg-primary-50 border border-primary-200 rounded-lg text-center max-w-md">
            <h1 className="text-xl font-bold text-primary-800 mb-3">Acesso Limitado</h1>
            <p className="text-primary-700 mb-4">
              Sua conta não tem perfil de estudante associado. Não é possível gerenciar perfil.
            </p>
            <p className="text-sm text-primary-600 mb-4">
              Entre em contato com o administrador para mais informações.
            </p>
            <Button 
              variant="default" 
              className="bg-primary-500 hover:bg-primary-600"
              onClick={() => router.push('/dashboard')}
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handlePerfilSubmit = async (data: any) => {
    try {
      setPerfilStatus(ApiStatus.LOADING);
      setPerfilError(null);
      await updatePerfil(data);
      setPerfilStatus(ApiStatus.SUCCESS);
    } catch (error: any) {
      setPerfilError(error.message || 'Erro ao atualizar perfil');
      setPerfilStatus(ApiStatus.ERROR);
    }
  };
  const handleSenhaSubmit = async (data: { senhaAtual: string; novaSenha: string; confirmarSenha: string }) => {
    try {
      setSenhaStatus(ApiStatus.LOADING);
      setSenhaError(null);
      await alterarSenha(data);
      setSenhaStatus(ApiStatus.SUCCESS);
    } catch (error: any) {
      setSenhaError(error.message || 'Erro ao alterar senha');
      setSenhaStatus(ApiStatus.ERROR);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>          <h1 className="text-2xl font-bold text-primary-900">Meu Perfil</h1>
          <p className="text-primary-700">Gerencie suas informações e senha</p>
        </div>

        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList>
            <TabsTrigger value="perfil">Dados do Perfil</TabsTrigger>
            <TabsTrigger value="senha">Alterar Senha</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e configurações da conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PerfilForm
                  estudante={estudante}
                  provincias={provincias}
                  onSubmit={handlePerfilSubmit}
                  status={perfilStatus}
                  error={perfilError}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="senha" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Atualize sua senha para manter sua conta segura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlterarSenhaForm
                  onSubmit={handleSenhaSubmit}
                  status={senhaStatus}
                  error={senhaError}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
