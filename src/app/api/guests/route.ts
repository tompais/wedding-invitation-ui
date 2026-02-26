import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { guestCodeSchema } from "@/schemas/rsvp.schema";
import type { Guest, Group, Confirmation } from "@/types/database";

// Marcar como dinámico para que Next.js no lo pre-renderice durante el build
export const dynamic = "force-dynamic";

/**
 * API ROUTE: GET /api/guests?code=123456
 *
 * Obtiene un invitado por su código único de invitación
 * Incluye: grupo familiar, confirmación previa
 *
 * @query code - Código del invitado (ej: 123456)
 * @returns Guest con relaciones o 404
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener el código desde query params
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "El parámetro 'code' es requerido" },
        { status: 400 }
      );
    }

    // Validar formato del código con Zod
    const validation = guestCodeSchema.safeParse({ code });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Formato de código inválido" },
        { status: 400 }
      );
    }

    // Buscar invitado en la base de datos
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

    // Type assertion: Supabase client devuelve 'never' con select("*")
    // Ver: https://github.com/supabase/supabase-js/issues/743
    const guestData = guest as Guest;

    // Buscar grupo si existe
    let group = null;
    if (guestData.group_id) {
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", guestData.group_id)
        .single();

      if (!groupError && groupData) {
        // Buscar otros invitados del grupo
        const { data: groupGuests } = await supabase
          .from("guests")
          .select("id, first_name, last_name, code")
          .eq("group_id", guestData.group_id);

        // Mapear snake_case (DB) a camelCase (API response)
        type GroupGuestRow = Pick<
          Guest,
          "id" | "first_name" | "last_name" | "code"
        >;
        const mappedGuests = (
          (groupGuests || []) as unknown as GroupGuestRow[]
        ).map((g) => ({
          id: g.id,
          firstName: g.first_name,
          lastName: g.last_name,
          code: g.code,
        }));

        const groupTyped = groupData as Group;
        group = {
          id: groupTyped.id,
          name: groupTyped.name,
          guests: mappedGuests,
        };
      }
    }

    // Buscar confirmación del invitado
    const { data: confirmations } = await supabase
      .from("confirmations")
      .select(
        "*, confirmed_by:guests!confirmed_by_id(id, first_name, last_name)"
      )
      .eq("guest_id", guestData.id)
      .limit(1);

    // Type assertion: joins con select() devuelven 'never'
    type ConfirmationWithJoin = Confirmation & {
      confirmed_by: Pick<Guest, "id" | "first_name" | "last_name">;
    };
    const confirmation = confirmations?.[0] as ConfirmationWithJoin | undefined;

    return NextResponse.json({
      id: guestData.id,
      firstName: guestData.first_name,
      lastName: guestData.last_name,
      code: guestData.code,
      phone: guestData.phone,
      group: group,
      confirmation: confirmation
        ? {
            civilAttending: confirmation.civil_attending,
            partyAttending: confirmation.party_attending,
            confirmedBy: confirmation.confirmed_by,
            confirmedAt: confirmation.confirmed_at,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching guest:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
