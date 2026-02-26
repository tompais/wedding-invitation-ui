"use server";
import { supabase } from "@/lib/supabase";
import { RSVP_CONFIG } from "@/constants/rsvp";
import { groupConfirmationSchema } from "@/schemas/rsvp.schema";
import type { ConfirmationInsert, ConfirmationUpdate } from "@/types/database";
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

    // Guardar cada confirmación directamente en Supabase (insert o update)
    for (const conf of confirmations) {
      const { data: existing } = await supabase
        .from("confirmations")
        .select("id")
        .eq("guest_id", conf.guestId)
        .single();

      if (existing) {
        const payload: ConfirmationUpdate = {
          civil_attending: conf.civilAttending,
          party_attending: conf.partyAttending,
          confirmed_by_id: confirmedById,
          group_id: confirmerData.group_id,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from("confirmations")
          .update(payload as never)
          .eq("guest_id", conf.guestId);
        if (error) {
          return { success: false, error: RSVP_CONFIG.messages.errors.error };
        }
      } else {
        const payload: ConfirmationInsert = {
          guest_id: conf.guestId,
          confirmed_by_id: confirmedById,
          group_id: confirmerData.group_id,
          civil_attending: conf.civilAttending,
          party_attending: conf.partyAttending,
        };
        const { error } = await supabase
          .from("confirmations")
          .insert(payload as never);
        if (error) {
          return { success: false, error: RSVP_CONFIG.messages.errors.error };
        }
      }
    }

    return { success: true, error: null };
  } catch {
    return { success: false, error: RSVP_CONFIG.messages.errors.error };
  }
}
