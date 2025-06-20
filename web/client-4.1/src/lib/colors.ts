// Sistema de cores do Eureka
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tipos de cor
type ColorWeight = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

type ColorPalette = {
  [key in ColorWeight]: string;
};

// Paleta Principal
export const primary: ColorPalette = {
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
  950: '#2e1065'
} as const;

// Tons de cinza
export const slate: ColorPalette = {
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
  950: '#020617'
} as const;

// Cores de status
export const status = {
  success: '#10b981', // Verde
  error: '#ef4444',   // Vermelho
  warning: '#f59e0b', // Amarelo
  info: '#3b82f6'     // Azul
} as const;

// Função para mesclar classes CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tipos de cor
export type ColorPath = keyof typeof primary | keyof typeof slate;
export type ColorValue = typeof primary[ColorPath] | typeof slate[ColorPath];

// Função para obter uma cor da paleta
export function getColor(color: string, weight: ColorWeight): string {
  const palettes = { primary, slate };
  const palette = palettes[color as keyof typeof palettes];
  return palette ? palette[weight] : '';
}

// Função para obter uma cor de status
export function getStatusColor(type: 'success' | 'error' | 'warning' | 'info'): string {
  return status[type];
}

// Exportação completa
export const colors = {
  primary,
  slate,
  status,
  getColor,
} as const;

export default colors;
