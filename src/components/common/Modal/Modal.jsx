// eslint-disable-next-line no-unused-vars -- motion se usa en JSX (motion.div)
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import "./Modal.css";

/**
 * COMPONENTE REUTILIZABLE: Modal
 *
 * Responsabilidad (SOLID - Single Responsibility):
 * - Mostrar contenido en un overlay modal
 * - Manejar cierre al hacer click fuera
 * - Proporcionar animaciones de entrada/salida
 *
 * Principios aplicados:
 * - KISS: Simple y directo
 * - Reutilizable: Acepta cualquier contenido como children
 * - Accesible: Incluye aria-labels y manejo de teclado
 *
 * @param {boolean} isOpen - Si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {ReactNode} children - Contenido del modal
 * @param {string} title - Título opcional del modal
 */
function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  /**
   * Maneja el click en el overlay (fondo oscuro)
   * Cierra el modal si se clickea fuera del contenido
   */
  const handleOverlayClick = (e) => {
    // Solo cierra si el click fue en el overlay, no en el contenido
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      onClick={handleOverlayClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        {/* Título opcional */}
        {title && (
          <h3 id="modal-title" className="modal-title">
            {title}
          </h3>
        )}

        {/* Contenido del modal */}
        <div className="modal-body">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// Validación de props (buena práctica de React)
Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  title: PropTypes.string,
};

export default Modal;
