"use server";
import { api } from "@/lib/api";
import { RSVP_CONFIG } from "@/constants/rsvp";
import type { ConfirmationRequest, ConfirmationResponse } from "@/types/api";
import type { ActionState } from "@/types/ActionState";

export async function confirmAttendanceAction(
  prevState: ActionState,
  formData: FormData
) {
  try {
    // Extraer datos del formulario
    const confirmedById = formData.get("confirmedById") as string;
    const confirmations = JSON.parse(formData.get("confirmations") as string);

    const requestBody: ConfirmationRequest = {
      confirmedById,
      confirmations,
    };

    const { error } = await api.post<ConfirmationResponse, ConfirmationRequest>(
      "/api/confirmation",
      requestBody
    );

    if (error) {
      return { success: false, error: RSVP_CONFIG.messages.errors.error };
    }
    return { success: true, error: null };
  } catch {
    return { success: false, error: RSVP_CONFIG.messages.errors.error };
  }
}
