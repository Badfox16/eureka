// Sistema de cores do Eureka

// Paleta Principal
export const primary = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8b5cf6',
  600: '#7c3aed', // Principal
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95',
  950: '#2e1065',
};

// Tons de cinza
export const slate = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
};

// Estados e Feedbacks
export const status = {
  success: '#22c55e', // Verde
  error: '#ef4444',   // Vermelho
  warning: '#f59e0b', // Amarelo
  info: '#3b82f6',    // Azul
};

// Cores do Sistema
export const system = {
  background: {
    light: '#ffffff',
    dark: slate[950],
  },
  card: {
    light: '#ffffff',
    dark: slate[900],
  },
  input: {
    light: slate[100],
    dark: slate[800],
  },
  text: {
    primary: {
      light: slate[800],
      dark: '#ffffff',
    },
    secondary: {
      light: slate[500],
      dark: slate[400],
    },
    muted: {
      light: slate[400],
      dark: slate[500],
    },
    accent: {
      light: primary[600],
      dark: primary[400],
    },
  },
  border: {
    light: slate[200],
    dark: slate[700],
  },
  separator: {
    light: slate[200],
    dark: slate[700],
  },
};

// Função para pegar a cor com base no tema
export const getColor = (colorPath: string, isDark: boolean = false): string => {
  // Formato: 'primary.600' ou 'system.text.primary'
  const parts = colorPath.split('.');
  
  // Cores simples
  if (parts.length === 2) {
    const [palette, shade] = parts;
    switch (palette) {
      case 'primary':
        if (shade in primary) {
          return primary[shade as unknown as keyof typeof primary];
        }
        return '#000000';
      case 'slate':
        if (shade in slate) {
          return slate[shade as unknown as keyof typeof slate];
        }
        return '#000000';
      case 'status':
        if (shade in status) {
          return status[shade as keyof typeof status];
        }
        return '#000000';
      default:
        return '#000000';
    }
  }
  
  // Cores de sistema com temas
  if (parts.length === 3) {
    const [category, subcategory, property] = parts;
    if (category === 'system') {
      const section = system[subcategory as keyof typeof system];
      if (typeof section === 'object') {
        if ('light' in section && 'dark' in section) {
          return isDark ? section.dark : section.light;
        } else if (property && property in section) {
          const subsection = section[property as keyof typeof section];
          if (typeof subsection === 'object' && 'light' in subsection && 'dark' in subsection) {
            return isDark ? subsection.dark : subsection.light;
          }
        }
      }
    }
  }
  
  // Fallback
  return '#000000';
};

// Exportação completa
export default {
  primary,
  slate,
  status,
  system,
  getColor,
};