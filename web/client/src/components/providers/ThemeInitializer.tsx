"use client";

import { useEffect } from "react";

export function ThemeInitializer() {
  useEffect(() => {
    // Script para inicializar o tema com base no localStorage
    const initTheme = () => {
      // Verificar o tema armazenado no localStorage
      const storedTheme = localStorage.getItem("theme");
      
      // Verificar se há uma preferência de tema salva
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (storedTheme === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        // Se não houver preferência, usar a preferência do sistema
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("theme", "light");
        }
      }
    };

    initTheme();
    
    // Monitorar alterações na preferência de tema do sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const currentTheme = localStorage.getItem("theme");
      // Só alterar se o usuário não tiver definido uma preferência
      if (!currentTheme || currentTheme === "system") {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };
    
    // Adicionar o listener para alterações na preferência do sistema
    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return null;
}
