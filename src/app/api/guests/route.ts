import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { guestCodeSchema } from "@/schemas/rsvp.schema";
import type { Guest, Confirmation } from "@/types/database";

// ─── Expiration helpers ────────────────────────────────────────────────────

/**
 * Parses RSVP_DEADLINE env var as a UTC-offset-aware timestamp.
 * Returns null if the var is unset or unparseable.
 */
function getRsvpDeadline(): Date | null {
  const raw = process.env.RSVP_DEADLINE;
  if (!raw) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Returns true if the deadline has passed AND the guest has no prior confirmation.
 * If RSVP_DEADLINE is unset, always returns false (no restriction).
 */
function computeInvitationExpired(
  deadline: Date | null,
  hasConfirmation: boolean
): boolean {
  if (!deadline) return false;
  return new Date() > deadline && !hasConfirmation;
}

// Marcar como dinámico para que Next.js no lo pre-renderice durante el build
export const dynamic = "force-dynamic";

// ─── Tipos internos para las respuestas anidadas de Supabase ───────────────
// Supabase devuelve 'never' con select("*") y tipos imprecisos con nested
// selects — usamos type assertions explícitos para mantener type-safety.

// Nota: confirmations es un array por la forma en que Supabase devuelve nested selects,
// pero la DB garantiza máximo una confirmación por invitado via unique index
// `confirmations_guest_id_key` — por eso usamos [0] de forma segura.
type NestedGroupRow = {
  id: string;
  name: string;
  guests: Array<{
    id: string;
    first_name: string;
    last_name: string;
    code: string;
    confirmations: Array<{
      civil_attending: boolean;
      party_attending: boolean;
    }>;
  }>;
};

type ConfirmationWithJoin = Confirmation & {
  confirmed_by: Pick<Guest, "id" | "first_name" | "last_name">;
};

// ─── Route handler ─────────────────────────────────────────────────────────

/**
 * API ROUTE: GET /api/guests?code=123456
 *
 * Obtiene un invitado por su código único de invitación.
 * Incluye: grupo familiar (con estado de confirmación por miembro), confirmación propia.
 *
 * Estrategia de performance: después de obtener el invitado base, se ejecutan
 * en paralelo (Promise.all) la consulta de grupo y la de confirmación propia,
 * reduciendo los round-trips de 4-5 a 2 fases.
 * El grupo usa un nested select de Supabase para traer miembros + sus
 * confirmaciones en una sola query SQL.
 *
 * @query code - Código del invitado (ej: 123456)
 * @returns GuestResponse con relaciones o 404
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "El parámetro 'code' es requerido" },
        { status: 400 }
      );
    }

    const validation = guestCodeSchema.safeParse({ code });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Formato de código inválido" },
        { status: 400 }
      );
    }

    // Fase 1: obtener el invitado base (necesario para las queries siguientes)
    const { data: guest, error: guestError } = await supabase
      .from("guests")
      .select("*")
      .eq("code", validation.data.code)
      .single();

    if (guestError || !guest) {
      return NextResponse.json(
        { error: "Invitado no encontrado" },
        { status: 404 }
      );
    }

    // Type assertion: Supabase devuelve 'never' con select("*")
    // Ver: https://github.com/supabase/supabase-js/issues/743
    const guestData = guest as Guest;

    // Fase 2: queries paralelas — grupo (con nested members + confirmations)
    // y confirmación propia del invitado.
    const [groupResult, confirmationsResult] = await Promise.all([
      // 2a: grupo + miembros + confirmación de cada miembro (una sola SQL query)
      guestData.group_id
        ? supabase
            .from("groups")
            .select(
              `id, name, guests:guests!group_id (
                id, first_name, last_name, code,
                confirmations!guest_id ( civil_attending, party_attending )
              )`
            )
            .eq("id", guestData.group_id)
            .single()
        : Promise.resolve({ data: null, error: null }),

      // 2b: confirmación propia del invitado (con quién la gestionó)
      supabase
        .from("confirmations")
        .select(
          "*, confirmed_by:guests!confirmed_by_id(id, first_name, last_name)"
        )
        .eq("guest_id", guestData.id)
        .limit(1),
    ]);

    // Mapear grupo
    let group = null;
    if (!groupResult.error && groupResult.data) {
      const groupTyped = groupResult.data as unknown as NestedGroupRow;
      group = {
        id: groupTyped.id,
        name: groupTyped.name,
        guests: groupTyped.guests.map((g) => ({
          id: g.id,
          firstName: g.first_name,
          lastName: g.last_name,
          code: g.code,
          confirmation: g.confirmations[0]
            ? {
                civilAttending: g.confirmations[0].civil_attending,
                partyAttending: g.confirmations[0].party_attending,
              }
            : null,
        })),
      };
    }

    // Mapear confirmación propia
    const confirmation = confirmationsResult.data?.[0] as
      | ConfirmationWithJoin
      | undefined;

    // confirmation fue fetcheado en la Fase 2 — se reutiliza sin query extra
    const deadline = getRsvpDeadline();
    const hasConfirmation = confirmation !== undefined;

    return NextResponse.json({
      id: guestData.id,
      firstName: guestData.first_name,
      lastName: guestData.last_name,
      code: guestData.code,
      phone: guestData.phone,
      group,
      confirmation: confirmation
        ? {
            civilAttending: confirmation.civil_attending,
            partyAttending: confirmation.party_attending,
            confirmedBy: confirmation.confirmed_by,
            confirmedAt: confirmation.confirmed_at,
          }
        : null,
      rsvpDeadline: deadline ? deadline.toISOString() : null,
      invitationExpired: computeInvitationExpired(deadline, hasConfirmation),
    });
  } catch (error) {
    console.error("Error fetching guest:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
