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
 * @param initialState - Estado inicial del modal (abierto/cerrado)
 * @returns Objeto con estado y funciones de control
 *
 * @example
 * const { isOpen, open, close } = useModal();
 *
 * <button onClick={open}>Abrir Modal</button>
 * {isOpen && <Modal onClose={close}>Contenido</Modal>}
 */

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal(initialState: boolean = false): UseModalReturn {
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
