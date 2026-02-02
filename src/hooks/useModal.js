import { useState } from "react";

/**
 * HOOK PERSONALIZADO: useModal
 *
 * Responsabilidad (SOLID):
 * - Gestionar el estado de apertura/cierre de modales
 * - Proporcionar funciones para abrir/cerrar
 *
 * Beneficios:
 * - Reutilizable en cualquier componente que necesite un modal
 * - Lógica separada del componente (Single Responsibility)
 * - Evita duplicación de código (DRY)
 *
 * @returns {Object} { isOpen, open, close, toggle }
 *
 * Ejemplo de uso:
 * const { isOpen, open, close } = useModal();
 *
 * <button onClick={open}>Abrir Modal</button>
 * {isOpen && <Modal onClose={close}>Contenido</Modal>}
 */
export function useModal(initialState = false) {
  // Estado: controla si el modal está abierto o cerrado
  const [isOpen, setIsOpen] = useState(initialState);

  /**
   * Abre el modal
   */
  const open = () => setIsOpen(true);

  /**
   * Cierra el modal
   */
  const close = () => setIsOpen(false);

  /**
   * Alterna entre abierto y cerrado
   */
  const toggle = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
