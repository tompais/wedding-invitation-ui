"use server";
import { api } from "@/lib/api";
import { RSVP_CONFIG } from "@/constants/rsvp";
import { groupConfirmationSchema } from "@/schemas/rsvp.schema";
import type { GroupConfirmation } from "@/schemas/rsvp.schema";
import type { ConfirmationResponse } from "@/types/api";
import type { ActionState } from "@/types/ActionState";

export async function confirmAttendanceAction(
  prevState: ActionState,
  formData: FormData
) {
  try {
    // Extraer datos del formulario y validar con Zod antes de procesar
    const rawConfirmedById = formData.get("confirmedById");
    const rawConfirmations = formData.get("confirmations");

    if (!rawConfirmedById || !rawConfirmations) {
      return { success: false, error: RSVP_CONFIG.messages.errors.error };
    }

    let parsedConfirmations: unknown;
    try {
      parsedConfirmations = JSON.parse(rawConfirmations as string);
    } catch {
      return { success: false, error: RSVP_CONFIG.messages.errors.error };
    }

    const parsed = groupConfirmationSchema.safeParse({
      confirmedById: rawConfirmedById,
      confirmations: parsedConfirmations,
    });

    if (!parsed.success) {
      return { success: false, error: RSVP_CONFIG.messages.errors.error };
    }

    const { error } = await api.post<ConfirmationResponse, GroupConfirmation>(
      "/api/confirmation",
      parsed.data
    );

    if (error) {
      return { success: false, error: RSVP_CONFIG.messages.errors.error };
    }
    return { success: true, error: null };
  } catch {
    return { success: false, error: RSVP_CONFIG.messages.errors.error };
  }
}
