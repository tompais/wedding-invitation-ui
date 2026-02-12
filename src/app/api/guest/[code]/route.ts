import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { guestCodeSchema } from "@/schemas/rsvp.schema";
import type { Database } from "@/types/supabase";

// Type aliases para mejor legibilidad
type Guest = Database["public"]["Tables"]["guests"]["Row"];
type Group = Database["public"]["Tables"]["groups"]["Row"];
type Confirmation = Database["public"]["Tables"]["confirmations"]["Row"];

// Marcar como dinámico para que Next.js no lo pre-renderice durante el build
export const dynamic = "force-dynamic";

/**
 * API ROUTE: GET /api/guest/[code]
 *
 * Obtiene un invitado por su código único
 * Incluye: grupo familiar, confirmación previa
 *
 * @param code - Código del invitado (ej: 123456)
 * @returns Guest con relaciones o 404
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

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
          .select("id, first_name, last_name")
          .eq("group_id", guestData.group_id);

        const groupTyped = groupData as Group;
        group = {
          id: groupTyped.id,
          name: groupTyped.name,
          guests: groupGuests || [],
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
