"use server";
import { RSVP_CONFIG } from "@/constants/rsvp";
import { supabase } from "@/lib/supabase";
import { groupConfirmationSchema } from "@/schemas/rsvp.schema";
import type { ActionState } from "@/types/ActionState";

export async function confirmAttendanceAction(
  _prevState: ActionState,
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

    const { confirmedById, confirmations } = parsed.data;

    // Obtener group_id del invitado que confirma
    const { data: confirmerData } = await supabase
      .from("guests")
      .select("group_id")
      .eq("id", confirmedById)
      .single();

    if (!confirmerData) {
      return { success: false, error: RSVP_CONFIG.messages.errors.error };
    }

    // Upsert batch: INSERT ... ON CONFLICT (guest_id) DO UPDATE
    // Aprovecha el índice único confirmations_guest_id_key del schema.
    // Reduce N*(SELECT + INSERT/UPDATE) secuenciales a un único round-trip.
    // El trigger update_confirmations_updated_at actualiza updated_at automáticamente.
    const payload = confirmations.map((conf) => ({
      guest_id: conf.guestId,
      confirmed_by_id: confirmedById,
      group_id: confirmerData.group_id,
      civil_attending: conf.civilAttending,
      party_attending: conf.partyAttending,
    }));

    const { error } = await supabase
      .from("confirmations")
      .upsert(payload, { onConflict: "guest_id" });

    if (error) {
      return { success: false, error: RSVP_CONFIG.messages.errors.error };
    }

    return { success: true, error: null };
  } catch {
    return { success: false, error: RSVP_CONFIG.messages.errors.error };
  }
}
