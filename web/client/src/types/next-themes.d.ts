declare module 'next-themes' {
  interface ThemeProviderProps {
    children: React.ReactNode;
    forcedTheme?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
    storageKey?: string;
    themes?: string[];
    defaultTheme?: string;
    attribute?: string;
    value?: { [themeName: string]: string };
  }

  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;

  export function useTheme(): {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    themes: string[];
    systemTheme: string | undefined;
  };
}
