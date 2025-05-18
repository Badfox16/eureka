import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenIcon, BarChart3Icon, ClockIcon, CheckCircleIcon } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bem-vindo à Plataforma Eureka</h1>
        <p className="text-muted-foreground">
          Revise seus conteúdos e prepare-se para os exames de forma eficiente.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Disciplinas
            </CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Disciplinas disponíveis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avaliações
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Avaliações pendentes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quizzes Completos
            </CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pontuação Média
            </CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76%</div>
            <p className="text-xs text-muted-foreground">
              +4% em relação ao mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Disciplinas Recentes</CardTitle>
            <CardDescription>
              Continue os estudos de onde parou
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Matemática", progress: 75 },
                { name: "Português", progress: 45 },
                { name: "Física", progress: 60 },
              ].map((subject) => (
                <Link 
                  href={`/disciplinas/${subject.name.toLowerCase()}`} 
                  key={subject.name}
                  className="block"
                >
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="font-medium">{subject.name}</p>
                      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-primary-600 transition-all"
                          style={{ width: `${subject.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                      {subject.progress}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Próximas Avaliações</CardTitle>
            <CardDescription>
              Organize seu cronograma de estudos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Prova de Matemática", date: "25/05", timeLeft: "5 dias" },
                { name: "Quiz de Português", date: "22/05", timeLeft: "2 dias" },
                { name: "Prova de Física", date: "30/05", timeLeft: "10 dias" },
              ].map((exam) => (
                <div 
                  key={exam.name}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{exam.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {exam.date}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                    {exam.timeLeft}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}