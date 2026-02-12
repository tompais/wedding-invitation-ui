import "./Loading.css";

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
  size?: "small" | "medium" | "large";
  message?: string;
  overlay?: boolean;
}

export default function Loading({
  size = "medium",
  message = "",
  overlay = false,
}: LoadingProps) {
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
