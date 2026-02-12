/**
 * TEMA Y COLORES DE LA APLICACIÓN
 *
 * Centraliza todos los valores de diseño para:
 * - Mantener consistencia visual
 * - Facilitar cambios globales
 * - Evitar repetición de valores (DRY)
 */

interface ColorPalette {
  dark: string;
  base: string;
  light: string;
}

interface TextColors {
  dark: string;
  muted: string;
  light: string;
}

interface Theme {
  bourdeaux: ColorPalette;
  hueso: {
    base: string;
    dark: string;
  };
  text: TextColors;
}

interface Fonts {
  display: string;
  body: string;
}

interface Breakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
}

interface AnimationTimings {
  fast: number;
  medium: number;
  slow: number;
}

interface Animations {
  scrollDelay: AnimationTimings;
  duration: AnimationTimings;
}

export const COLORS: Theme = {
  bourdeaux: {
    dark: "#5A1F28",
    base: "#722F37",
    light: "#8B4450",
  },
  hueso: {
    base: "#FAF0E6",
    dark: "#F5E6D3",
  },
  text: {
    dark: "#2C1810",
    muted: "rgba(44, 24, 16, 0.7)",
    light: "rgba(250, 240, 230, 0.95)",
  },
} as const;

export const FONTS: Fonts = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Lora', Georgia, serif",
} as const;

export const BREAKPOINTS: Breakpoints = {
  mobile: "480px",
  tablet: "768px",
  desktop: "1024px",
} as const;

export const ANIMATIONS: Animations = {
  scrollDelay: {
    fast: 0.2,
    medium: 0.4,
    slow: 0.6,
  },
  duration: {
    fast: 0.3,
    medium: 0.6,
    slow: 0.8,
  },
} as const;
