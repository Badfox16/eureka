// src/app/dashboard/configuracoes/page.tsx
"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function ConfiguracoesPage() {
  const [notificacoesEmail, setNotificacoesEmail] = useState(true)
  const [modoEscuro, setModoEscuro] = useState(false)

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="conta">Conta</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure as preferências gerais do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notificacoes-email">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações importantes por email
                  </p>
                </div>
                <Switch
                  id="notificacoes-email"
                  checked={notificacoesEmail}
                  onCheckedChange={setNotificacoesEmail}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="modo-escuro">Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Ative o modo escuro para reduzir o cansaço visual
                  </p>
                </div>
                <Switch
                  id="modo-escuro"
                  checked={modoEscuro}
                  onCheckedChange={setModoEscuro}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="conta">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" defaultValue="Administrador" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@exemplo.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha-atual">Senha Atual</Label>
                <Input id="senha-atual" type="password" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nova-senha">Nova Senha</Label>
                  <Input id="nova-senha" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmar-senha">Confirmar Senha</Label>
                  <Input id="confirmar-senha" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Atualizar Perfil</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sistema">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Configure os parâmetros do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-url">URL da API</Label>
                <Input id="api-url" defaultValue="http://localhost:3001/api" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="items-por-pagina">Itens por Página</Label>
                <Input id="items-por-pagina" type="number" defaultValue="10" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tempo-sessao">Tempo de Sessão (minutos)</Label>
                <Input id="tempo-sessao" type="number" defaultValue="60" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Salvar Configurações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}