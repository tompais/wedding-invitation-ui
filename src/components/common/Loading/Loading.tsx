import "./Loading.css";
import { LoadingSize } from "@/types/LoadingSize";

/**
 * COMPONENTE REUTILIZABLE: Loading
 *
 * Responsabilidad (SOLID - Single Responsibility):
 * - Mostrar indicador de carga visual
 * - Soportar diferentes tamaños
 * - Modo overlay para pantalla completa
 *
 * Principios aplicados:
 * - DRY: Componente único de loading para toda la app
 * - KISS: Simple spinner animado
 * - Reutilizable: Acepta props para personalización
 */

interface LoadingProps {
  size?: LoadingSize;
  message?: string;
  overlay?: boolean;
}

export default function Loading({
  size = LoadingSize.MEDIUM,
  message = "",
  overlay = false,
}: Readonly<LoadingProps>) {
  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className={`loading-spinner loading-spinner--${size}`}></div>
          {message && <p className="loading-message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className={`loading-spinner loading-spinner--${size}`}></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}
