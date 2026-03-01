"use client";

import { useFormStatus } from "react-dom";
import type {
  CSSProperties,
  ComponentPropsWithoutRef,
  MouseEvent,
  ReactNode,
} from "react";

type SubmitButtonVariant = "filled" | "outline";

interface SubmitButtonProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "type" | "children"
> {
  label: ReactNode;
  loadingLabel?: ReactNode;
  variant?: SubmitButtonVariant;
}

const variantBaseStyles: Record<SubmitButtonVariant, CSSProperties> = {
  filled: {
    backgroundColor: "var(--hueso)",
    color: "var(--bourdeaux-dark)",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: "2px",
    borderColor: "var(--hueso)",
    color: "var(--hueso)",
  },
};

/**
 * Botón de submit que lee el estado `pending` del <form> padre.
 * Debe renderizarse como hijo directo (o descendiente) de un <form>
 * para que useFormStatus funcione correctamente.
 *
 * Encapsula los estilos base y el comportamiento hover/disabled,
 * evitando que los componentes callers manejen esa lógica inline.
 */
export function SubmitButton({
  label,
  loadingLabel = "Enviando...",
  disabled,
  variant = "filled",
  style,
  ...props
}: Readonly<SubmitButtonProps>) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;
  const isLoading = pending;

  const baseStyle: CSSProperties = { ...variantBaseStyles[variant], ...style };

  const handleMouseEnter = (e: MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.disabled) return;
    if (variant === "outline") {
      e.currentTarget.style.backgroundColor = "var(--hueso)";
      e.currentTarget.style.color = "var(--bourdeaux)";
    } else {
      e.currentTarget.style.backgroundColor = "var(--hueso-dark)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(250, 240, 230, 0.3)";
    }
    e.currentTarget.style.transform = "translateY(-2px)";
  };

  const handleMouseLeave = (e: MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.disabled) return;
    if (variant === "outline") {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = "var(--hueso)";
    } else {
      e.currentTarget.style.backgroundColor = "var(--hueso)";
      e.currentTarget.style.boxShadow = "none";
    }
    e.currentTarget.style.transform = "translateY(0)";
  };

  return (
    <button
      type="submit"
      {...props}
      style={baseStyle}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isLoading ? loadingLabel : label}
    </button>
  );
}
