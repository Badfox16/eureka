import { create } from 'twrnc';
import { useColorScheme } from 'react-native';

// Cria a instância do tailwind
const tw = create({
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed', // Violet-600
        secondary: '#8b5cf6',
      },
    },
  },
});

// Hook para usar tailwind com suporte a tema escuro/claro
export function useTailwind() {
  const colorScheme = useColorScheme();
  
  // Retorna o objeto tw com funções adicionais
  return {
    // Método principal para estilização
    style: (classNames: string) => {
      const processedClasses = colorScheme === 'dark' 
        ? classNames
        : classNames.replace(/\bdark:[^\s]+/g, '');
      
      return tw.style(processedClasses);
    },
    
    // Função auxiliar para obter cores
    color: (className: string) => {
      const style = tw.style(`text-${className}`);
      return style.color;
    }
  };
}