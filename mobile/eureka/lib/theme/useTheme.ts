import { useColorScheme } from 'react-native';
import { useTailwind } from '../tailwind';
import colors, { getColor } from './colors';

export function useTheme() {
  const colorScheme = useColorScheme();
  const tw = useTailwind();
  const isDark = colorScheme === 'dark';
  
  return {
    // Cores diretas com suporte a tema
    colors: {
      // Paletas completas
      primary: colors.primary,
      slate: colors.slate,
      status: colors.status,
      
      // Acesso simplificado a cores comuns
      background: isDark ? colors.system.background.dark : colors.system.background.light,
      card: isDark ? colors.system.card.dark : colors.system.card.light,
      input: isDark ? colors.system.input.dark : colors.system.input.light,
      text: {
        primary: isDark ? colors.system.text.primary.dark : colors.system.text.primary.light,
        secondary: isDark ? colors.system.text.secondary.dark : colors.system.text.secondary.light,
        muted: isDark ? colors.system.text.muted.dark : colors.system.text.muted.light,
        accent: isDark ? colors.system.text.accent.dark : colors.system.text.accent.light,
      },
      border: isDark ? colors.system.border.dark : colors.system.border.light,
      separator: isDark ? colors.system.separator.dark : colors.system.separator.light,
    },
    
    // Função auxiliar para obter cores
    getColor: (path: string) => getColor(path, isDark),
    
    // Se é tema escuro
    isDark,
    
    // Referência ao tailwind para uso conjunto
    tw,
  };
}