"use client";

import { motion } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

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
 */

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly title?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
}: Readonly<ModalProps>) {
  if (!isOpen) return null;

  /**
   * Maneja el click en el overlay (fondo oscuro)
   * Cierra el modal si se clickea fuera del contenido
   */
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    // Solo cierra si el click fue en el overlay, no en el contenido
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      className="flex fixed inset-0 justify-center items-center p-8 md:p-4 z-1000"
      style={{ backgroundColor: "rgba(90, 31, 40, 0.85)" }}
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
        className="overflow-y-auto relative p-8 w-full rounded-2xl md:p-6 max-h-[90vh] max-w-150 md:max-h-[85vh]"
        style={{
          backgroundColor: "var(--hueso)",
          boxShadow: "0 15px 40px rgba(90, 31, 40, 0.35)",
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        <button
          type="button"
          className="flex absolute top-4 right-4 justify-center items-center p-2 w-10 h-10 text-3xl rounded-full border-none transition-all duration-200 hover:bg-hueso-dark"
          style={{
            background: "none",
            color: "var(--bourdeaux)",
          }}
          onClick={onClose}
          aria-label="Cerrar modal"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--hueso-dark)";
            e.currentTarget.style.color = "var(--bourdeaux-dark)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--bourdeaux)";
          }}
        >
          ✕
        </button>

        {/* Título opcional */}
        {title && (
          <h3
            id="modal-title"
            className="mt-0 mb-6 text-2xl md:mb-4 md:text-xl font-display"
            style={{ color: "var(--bourdeaux-dark)" }}
          >
            {title}
          </h3>
        )}

        {/* Contenido del modal */}
        <div style={{ color: "var(--text-dark)" }}>{children}</div>
      </motion.div>
    </motion.div>
  );
}
