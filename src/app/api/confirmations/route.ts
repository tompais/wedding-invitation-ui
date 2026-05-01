import { type NextRequest, NextResponse } from "next/server";
import { computeInvitationExpired, getRsvpDeadline } from "@/lib/rsvp-deadline";
import { supabase } from "@/lib/supabase";
import { groupConfirmationSchema } from "@/schemas/rsvp.schema";
import type {
  Confirmation,
  ConfirmationInsert,
  ConfirmationUpdate,
  Guest,
} from "@/types/database";

// Marcar como dinámico para que Next.js no lo pre-renderice durante el build
export const dynamic = "force-dynamic";

/**
 * API ROUTE: POST /api/confirmations
 *
 * Crea confirmaciones de asistencia para uno o más invitados
 * Permite confirmación grupal (ej: padre confirma por familia)
 *
 * Body esperado:
 * {
 *   confirmedById: "uuid",
 *   confirmations: [
 *     { guestId: "uuid", civilAttending: true, partyAttending: true }
 *   ]
 * }
 */

// Función auxiliar: verifica existencia de invitado
async function getGuestById(guestId: string): Promise<Guest | null> {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("id", guestId)
    .single();
  return error || !data ? null : (data as Guest);
}

// ─── Discriminated union for upsertConfirmation result ────────────────────
type UpsertOk = { kind: "ok"; data: Confirmation };
type UpsertError = { kind: "error"; error: string };
type UpsertExpired = { kind: "expired" };
type UpsertResult = UpsertOk | UpsertError | UpsertExpired;

// Función auxiliar: crea o actualiza una confirmación
async function upsertConfirmation(
  conf: { guestId: string; civilAttending: boolean; partyAttending: boolean },
  confirmedById: string,
  groupId: string | null
): Promise<UpsertResult> {
  // Verificar si ya existe confirmación
  const { data: existingConfirmation } = await supabase
    .from("confirmations")
    .select("*")
    .eq("guest_id", conf.guestId)
    .single();

  // ─── Verificar si la invitación expiró ────────────────────────────────
  // Reutiliza existingConfirmation ya fetcheado — sin query extra.
  // Solo bloquea si el invitado NO tiene confirmación previa.
  const deadline = getRsvpDeadline();
  if (computeInvitationExpired(deadline, existingConfirmation !== null)) {
    return { kind: "expired" };
  }
  // ─────────────────────────────────────────────────────────────────────

  if (existingConfirmation) {
    // Actualizar confirmación existente
    const updatePayload: ConfirmationUpdate = {
      civil_attending: conf.civilAttending,
      party_attending: conf.partyAttending,
      confirmed_by_id: confirmedById,
      group_id: groupId,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from("confirmations")
      .update(updatePayload as never)
      .eq("guest_id", conf.guestId)
      .select()
      .single();
    if (error) {
      return {
        kind: "error",
        error: `Error updating confirmation: ${error.message}`,
      };
    }
    return { kind: "ok", data: data as Confirmation };
  } else {
    // Crear nueva confirmación
    const insertPayload: ConfirmationInsert = {
      guest_id: conf.guestId,
      confirmed_by_id: confirmedById,
      group_id: groupId,
      civil_attending: conf.civilAttending,
      party_attending: conf.partyAttending,
    };
    const { data, error } = await supabase
      .from("confirmations")
      .insert(insertPayload as never)
      .select()
      .single();
    if (error) {
      return {
        kind: "error",
        error: `Error creating confirmation: ${error.message}`,
      };
    }
    return { kind: "ok", data: data as Confirmation };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = groupConfirmationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }
    const { confirmedById, confirmations } = validation.data;
    // Verificar que el usuario que confirma exista
    const confirmerGuest = await getGuestById(confirmedById);
    if (!confirmerGuest) {
      return NextResponse.json(
        { error: "Usuario que confirma no encontrado" },
        { status: 404 }
      );
    }
    const createdConfirmations: Confirmation[] = [];
    for (const conf of confirmations) {
      // Verificar que el invitado exista
      const guest = await getGuestById(conf.guestId);
      if (!guest) {
        return NextResponse.json(
          { error: `Invitado ${conf.guestId} no encontrado` },
          { status: 404 }
        );
      }
      // Crear o actualizar confirmación
      const result = await upsertConfirmation(
        conf,
        confirmedById,
        confirmerGuest.group_id
      );
      if (result.kind === "expired") {
        return NextResponse.json(
          { error: "El plazo para confirmar tu asistencia ha expirado." },
          { status: 403 }
        );
      }
      if (result.kind === "error") {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      createdConfirmations.push(result.data);
    }
    return NextResponse.json(
      {
        message: "Confirmación registrada exitosamente",
        confirmations: createdConfirmations,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating confirmation:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * API ROUTE: GET /api/confirmations
 *
 * Obtiene estadísticas de confirmaciones (opcional, para dashboard)
 */
export async function GET() {
  try {
    const { count: totalConfirmations } = await supabase
      .from("confirmations")
      .select("*", { count: "exact", head: true });

    const { count: civilCount } = await supabase
      .from("confirmations")
      .select("*", { count: "exact", head: true })
      .eq("civil_attending", true);

    const { count: partyCount } = await supabase
      .from("confirmations")
      .select("*", { count: "exact", head: true })
      .eq("party_attending", true);

    return NextResponse.json({
      total: totalConfirmations || 0,
      civil: civilCount || 0,
      party: partyCount || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
