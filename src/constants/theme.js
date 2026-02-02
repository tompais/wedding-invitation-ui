/**
 * TEMA Y COLORES DE LA APLICACIÓN
 *
 * Centraliza todos los valores de diseño para:
 * - Mantener consistencia visual
 * - Facilitar cambios globales
 * - Evitar repetición de valores (DRY)
 */

export const COLORS = {
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
};

export const FONTS = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Lora', Georgia, serif",
};

export const BREAKPOINTS = {
  mobile: "480px",
  tablet: "768px",
  desktop: "1024px",
};

export const ANIMATIONS = {
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
};
