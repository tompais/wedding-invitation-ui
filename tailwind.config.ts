import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Burgundy scale (colores principales de la boda)
        bourdeaux: {
          dark: "#5A1F28",
          DEFAULT: "#722F37",
          light: "#8B4450",
        },
        // Cream scale (tonos claros)
        hueso: {
          dark: "#F5E6D3",
          DEFAULT: "#FAF0E6",
        },
        // Text colors
        text: {
          dark: "#2C2C2C",
          muted: "#6B6B6B",
          light: "#F5F5F5",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Lora", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in-out",
        "slide-up": "slideUp 0.8s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
