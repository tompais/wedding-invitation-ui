import PropTypes from "prop-types";
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
 *
 * @param {string} size - Tamaño del spinner: 'small', 'medium', 'large'
 * @param {string} message - Mensaje opcional a mostrar
 * @param {boolean} overlay - Si debe mostrarse como overlay de pantalla completa
 */
function Loading({ size = "medium", message = "", overlay = false }) {
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

Loading.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  message: PropTypes.string,
  overlay: PropTypes.bool,
};

export default Loading;
