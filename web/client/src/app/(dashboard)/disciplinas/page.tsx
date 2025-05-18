import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

// Dados simulados de disciplinas
const subjects = [
  {
    id: 1,
    name: "Matemática",
    description: "Álgebra, Geometria, Trigonometria",
    icon: "📐",
    progress: 65,
    quizCount: 12,
  },
  {
    id: 2,
    name: "Português",
    description: "Gramática, Literatura, Interpretação",
    icon: "📚",
    progress: 48,
    quizCount: 8,
  },
  {
    id: 3,
    name: "Física",
    description: "Mecânica, Eletricidade, Termodinâmica",
    icon: "⚛️",
    progress: 32,
    quizCount: 10,
  },
  {
    id: 4,
    name: "Química",
    description: "Química Orgânica, Inorgânica, Físico-Química",
    icon: "🧪",
    progress: 54,
    quizCount: 9,
  },
  {
    id: 5,
    name: "Biologia",
    description: "Genética, Ecologia, Fisiologia",
    icon: "🧬",
    progress: 78,
    quizCount: 14,
  },
  {
    id: 6,
    name: "História",
    description: "História Geral, História de Angola",
    icon: "🏛️",
    progress: 42,
    quizCount: 7,
  },
  {
    id: 7,
    name: "Geografia",
    description: "Geografia Humana, Física e Política",
    icon: "🌍",
    progress: 60,
    quizCount: 11,
  },
  {
    id: 8,
    name: "Inglês",
    description: "Gramática, Vocabulário, Compreensão",
    icon: "🇬🇧",
    progress: 25,
    quizCount: 6,
  },
];

export default function DisciplinasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Disciplinas</h1>
        <p className="text-muted-foreground">
          Explore as disciplinas disponíveis e pratique seus conhecimentos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {subjects.map((subject) => (
          <Card key={subject.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{subject.icon}</span>
                  <CardTitle>{subject.name}</CardTitle>
                </div>
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  {subject.progress}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                {subject.description}
              </p>
              
              <div className="mb-3">
                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-2 rounded-full bg-primary-600 transition-all"
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {subject.quizCount} quizzes disponíveis
                </span>
                <Link href={`/disciplinas/${subject.id}`}>
                  <Button variant="ghost" size="sm">
                    Explorar
                    <ArrowRightIcon className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}