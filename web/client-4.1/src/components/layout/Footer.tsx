"use client";

import { SocialLinks } from "@/components/SocialLinks";

export default function Footer() {
  return (
    <footer className="w-full py-8 px-4 bg-muted/50 backdrop-blur-sm border-t border-border mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:justify-between gap-8 items-center">
        <div className="flex flex-col md:flex-row gap-8 w-full md:w-auto justify-center md:justify-start">
          <div className="min-w-[180px] text-left">
            <div className="font-bold text-lg mb-1 text-primary-600 dark:text-primary-400">Missão</div>
            <div className="text-xs text-muted-foreground max-w-xs mb-2">
              Democratizar o acesso ao conhecimento, promovendo o crescimento estudantil com tecnologia, inovação e acolhimento.
            </div>
          </div>
          <div className="min-w-[180px] text-left">
            <div className="font-bold text-lg mb-1 text-primary-600 dark:text-primary-400">Visão</div>
            <div className="text-xs text-muted-foreground max-w-xs mb-2">
              Ser referência em educação digital, inspirando estudantes a alcançarem seu potencial máximo.
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 mt-6 md:mt-0">
          <span className="text-xs text-muted-foreground  text-primary-600 dark:text-primary-400 font-semibold">Siga nas redes:</span>
          <SocialLinks />
          <div className="text-[10px] text-muted-foreground mt-2">&copy; {new Date().getFullYear()} Eureka. Todos os direitos reservados.</div>
        </div>
      </div>
    </footer>
  );
}
