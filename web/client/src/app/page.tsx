import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-white dark:bg-slate-950">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Eureka Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-primary-600">Eureka</span>
          </div>

          <nav className="hidden md:flex">
            <ul className="flex space-x-8">
              <li>
                <a
                  href="#recursos"
                  className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
                >
                  Recursos
                </a>
              </li>
              <li>
                <a
                  href="#como-funciona"
                  className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
                >
                  Como Funciona
                </a>
              </li>
              <li>
                <a
                  href="#depoimentos"
                  className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
                >
                  Depoimentos
                </a>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
            >
              Login
            </Link>
            <Link
              href="/cadastro"
              className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Comece Grátis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-50 to-white py-20 dark:from-slate-900 dark:to-slate-950">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
              Prepare-se para exames <br className="hidden sm:inline" />
              <span className="text-primary-600 dark:text-primary-400">
                de forma inteligente
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Eureka é a plataforma que ajuda estudantes a se prepararem para
              exames e avaliações com quizzes personalizados, estatísticas
              detalhadas e materiais de revisão.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/cadastro"
                className="rounded-full bg-primary-600 px-8 py-3 text-base font-semibold text-white hover:bg-primary-700"
              >
                Comece Agora
              </Link>
              <Link
                href="/sobre"
                className="flex items-center text-base font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Saiba mais
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="recursos" className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Recursos que impulsionam seu aprendizado
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Tudo o que você precisa para se preparar para exames e avaliações
                no seu caminho acadêmico.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: "📚",
                  title: "Quizzes por Disciplina",
                  description:
                    "Pratique com quizzes específicos para cada disciplina e conte materiais.",
                },
                {
                  icon: "📊",
                  title: "Estatísticas de Desempenho",
                  description:
                    "Acompanhe seu progresso com estatísticas detalhadas e identificação de pontos fracos.",
                },
                {
                  icon: "🗓️",
                  title: "Planos de Estudo",
                  description:
                    "Crie planos de estudo personalizados com base nas suas necessidades.",
                },
                {
                  icon: "⏱️",
                  title: "Simulados Cronometrados",
                  description:
                    "Prepare-se com simulados que imitam o ambiente real de avaliação.",
                },
                {
                  icon: "🎯",
                  title: "Foco Personalizado",
                  description:
                    "Identifique e foque nos tópicos que mais precisam de atenção.",
                },
                {
                  icon: "🔔",
                  title: "Lembretes e Notificações",
                  description:
                    "Receba lembretes para manter a consistência nos estudos.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="mb-4 text-3xl">{feature.icon}</div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="bg-slate-50 py-20 dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Como funciona
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Três passos simples para começar sua jornada de preparação para
                exames.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Crie sua conta",
                  description:
                    "Cadastre-se gratuitamente e personalize seu perfil acadêmico.",
                },
                {
                  step: "02",
                  title: "Escolha seus materiais",
                  description:
                    "Selecione as disciplinas e tópicos que deseja estudar.",
                },
                {
                  step: "03",
                  title: "Comece a praticar",
                  description:
                    "Responda quizzes, acompanhe seu progresso e melhore continuamente.",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="relative rounded-lg bg-white p-6 shadow-sm dark:bg-slate-800"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    {step.step}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>

                  {index < 2 && (
                    <div className="absolute right-0 top-10 hidden h-0.5 w-16 bg-primary-200 md:block dark:bg-primary-800"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-primary-600 py-20 text-white dark:bg-primary-900">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Pronto para começar sua jornada?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-100">
              Junte-se a milhares de estudantes que estão melhorando sua
              preparação para exames com o Eureka.
            </p>
            <Link
              href="/cadastro"
              className="inline-block rounded-full bg-white px-8 py-3 text-base font-semibold text-primary-600 hover:bg-primary-50"
            >
              Criar conta gratuita
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-12 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
            <div>
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <Image
                  src="/logo.svg"
                  alt="Eureka Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
                <span className="text-lg font-bold text-primary-600">Eureka</span>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                © 2024 Eureka. Todos os direitos reservados.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:justify-end">
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
              >
                Termos de Uso
              </a>
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
              >
                Política de Privacidade
              </a>
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
              >
                Contato
              </a>
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
              >
                Sobre
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
