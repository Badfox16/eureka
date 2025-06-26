"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, BookOpen, Award, Brain, UsersRound, ArrowRight, ChevronUp } from "lucide-react";
import Footer from "@/components/layout/Footer";
import HomeHeader from "@/components/layout/HomeHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Detectar quando o usuário rolou o suficiente para mostrar o botão de voltar ao topo
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Função para rolar para o topo da página
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-primary-600" />,
      title: "Quizzes Dinâmicos",
      description: "Aprenda através de quizzes interativos que se adaptam ao seu ritmo de aprendizado."
    },
    {
      icon: <Award className="w-6 h-6 text-primary-600" />,
      title: "Acompanhe seu Progresso",
      description: "Visualize estatísticas detalhadas do seu desempenho e evolução ao longo do tempo."
    },
    {
      icon: <Brain className="w-6 h-6 text-primary-600" />,
      title: "Aprendizado Personalizado",
      description: "Conteúdo recomendado com base no seu histórico e áreas que precisam de mais atenção."
    },
    {
      icon: <UsersRound className="w-6 h-6 text-primary-600" />,
      title: "Comunidade Estudantil",
      description: "Conecte-se com outros estudantes para compartilhar conhecimento e dicas de estudo."
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <HomeHeader />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-gradient-to-b from-primary-50 to-background dark:from-primary-950/20 dark:to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-50">
                Descubra seu potencial com <span className="text-primary-600 dark:text-primary-400">Eureka</span>
              </h1>
              <p className="text-lg mb-8 text-slate-700 dark:text-slate-300">
                A plataforma que transforma a maneira como você estuda, aprende e evolui academicamente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Começar agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <Image 
                src="/home.svg" 
                alt="Estudantes aprendendo" 
                width={500} 
                height={400} 
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-50">
              Encontre o conteúdo ideal para seus estudos
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Pesquise entre milhares de quizzes, avaliações e materiais didáticos
            </p>
          </div>
          <form
            className="flex items-center gap-2 mb-8"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              className="flex-1 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Pesquisar avaliações, quizzes ou disciplinas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" className="py-3">
              <Search className="w-5 h-5" />
              <span className="hidden sm:inline">Buscar</span>
            </Button>
          </form>
          
          {/* Resultados de busca e filtros aparecerão aqui futuramente */}
          <div className="text-center text-muted-foreground">
            Digite para pesquisar avaliações ou quizzes disponíveis.
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-50">
              Por que escolher o Eureka?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Nossa plataforma foi desenvolvida pensando nas necessidades reais dos estudantes
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-primary-100 dark:border-primary-900 h-full">
                <CardHeader className="pb-2">
                  <div className="mb-2">{feature.icon}</div>
                  <CardTitle className="text-xl text-slate-900 dark:text-slate-50">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 dark:bg-primary-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Pronto para elevar seus estudos?
          </h2>
          <p className="text-lg mb-8 text-primary-100 max-w-2xl mx-auto">
            Junte-se a milhares de estudantes que já transformaram sua jornada acadêmica com o Eureka.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white text-primary-700 hover:bg-primary-50">
              Criar minha conta gratuita
            </Button>
          </Link>
        </div>
      </section>

      <Footer />

      {/* Botão de voltar ao topo */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-md transition-all duration-300 z-50"
          aria-label="Voltar ao topo"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </main>
  );
}
