"use client";

import { useFormStatus } from "react-dom";
import type { ComponentPropsWithoutRef } from "react";

interface SubmitButtonProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "type" | "children"
> {
  label: string;
  loadingLabel?: string;
}

/**
 * Botón de submit que lee el estado `pending` del <form> padre.
 * Debe renderizarse como hijo directo (o descendiente) de un <form>
 * para que useFormStatus funcione correctamente.
 */
export function SubmitButton({
  label,
  loadingLabel = "Enviando...",
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;
  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={pending}
      {...props}
    >
      {pending ? loadingLabel : label}
    </button>
  );
}
