import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getColor, primary } from "./colors";

/**
 * Combina classes CSS com suporte ao Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ajusta a opacidade de uma cor hexadecimal
 */
export function colorWithOpacity(color: string, opacity: number): string {
  if (!color) return color;

  // Remove o # do início se existir
  const hex = color.replace("#", "");

  // Converte hex para RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Retorna cor com opacidade em formato rgba
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Gera uma gradiente baseada na paleta principal
 */
const GradientShades = {
  400: "400" as const,
  600: "600" as const
} as const;

type GradientShade = keyof typeof GradientShades;

export function generateGradient(start: GradientShade = 400, end: GradientShade = 600): string {
  const startColor = getColor('primary', start);
  const endColor = getColor('primary', end);
  return `linear-gradient(135deg, ${startColor} 0%, ${endColor} 100%)`;
}

/**
 * Verifica se uma cor é clara ou escura
 */
export function isLightColor(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Calcula a luminância relativa
  // Fonte: https://www.w3.org/WAI/GL/wiki/Relative_luminance
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  return luminance > 0.5;
}

/**
 * Retorna a cor de texto ideal (claro/escuro) baseado na cor de fundo
 */
export function getContrastColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? "#000000" : "#ffffff";
}

/**
 * Converte uma cor CSS (hex, rgb, hsl) para hexadecimal
 */
export function toHex(color: string): string {
  // Se já for hex, retorna
  if (color.startsWith("#")) return color;

  // Cria um elemento temporário para usar as funções de cor do navegador
  const temp = document.createElement("div");
  temp.style.color = color;
  document.body.appendChild(temp);

  // Pega a cor computada
  const computed = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);

  // Converte rgb para hex
  const rgb = computed.match(/\d+/g);
  if (!rgb || rgb.length < 3) return color;

  const [r, g, b] = rgb;
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Modifica um valor HSL da cor
 */
export function adjustHSL(color: string, adjustment: { h?: number; s?: number; l?: number }): string {
  // Converte para hex primeiro
  const hex = toHex(color);

  // Converte hex para RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // Encontra os valores máximo e mínimo dos componentes RGB
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  // Calcula luminosidade
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // acromático
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  // Aplica os ajustes
  h = ((h * 360 + (adjustment.h || 0)) % 360) / 360;
  s = Math.min(1, Math.max(0, s + (adjustment.s || 0)));
  l = Math.min(1, Math.max(0, l + (adjustment.l || 0)));

  // Converte HSL de volta para RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r2 = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g2 = Math.round(hue2rgb(p, q, h) * 255);
  const b2 = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return (
    "#" +
    [r2, g2, b2]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Aplica um tom monocromático a uma cor (mais claro ou mais escuro)
 */
export function getTint(color: string, amount: number): string {
  return adjustHSL(color, { l: amount });
}

/**
 * Gera uma paleta de cores baseada em uma cor base
 */
export function generatePalette(baseColor: string): Record<number, string> {
  const palette: Record<number, string> = {};

  // Gera 10 tons da cor base
  Array.from({ length: 10 }, (_, i) => {
    const weight = (i + 1) * 100;
    const amount = (weight - 500) / 1000;
    palette[weight] = getTint(baseColor, amount);
  });

  return palette;
}
