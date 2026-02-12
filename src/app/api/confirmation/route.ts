import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { groupConfirmationSchema } from "@/schemas/rsvp.schema";
import type { Database } from "@/types/supabase";

// Type aliases para mejor legibilidad
type Guest = Database["public"]["Tables"]["guests"]["Row"];
type Confirmation = Database["public"]["Tables"]["confirmations"]["Row"];

// Marcar como dinámico para que Next.js no lo pre-renderice durante el build
export const dynamic = "force-dynamic";

/**
 * API ROUTE: POST /api/confirmation
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
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
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
    const { data: confirmer, error: confirmerError } = await supabase
      .from("guests")
      .select("*")
      .eq("id", confirmedById)
      .single();

    if (confirmerError || !confirmer) {
      return NextResponse.json(
        { error: "Usuario que confirma no encontrado" },
        { status: 404 }
      );
    }

    // Type assertion: Supabase client devuelve 'never' con select("*")
    // Ver: https://github.com/supabase/supabase-js/issues/743
    const confirmerGuest = confirmer as Guest;

    const createdConfirmations: Confirmation[] = [];

    for (const conf of confirmations) {
      // Verificar que el invitado exista
      const { data: guest, error: guestError } = await supabase
        .from("guests")
        .select("*")
        .eq("id", conf.guestId)
        .single();

      if (guestError || !guest) {
        return NextResponse.json(
          { error: `Invitado ${conf.guestId} no encontrado` },
          { status: 404 }
        );
      }

      // Verificar si ya existe confirmación
      const { data: existingConfirmation } = await supabase
        .from("confirmations")
        .select("*")
        .eq("guest_id", conf.guestId)
        .single();

      let confirmation;

      if (existingConfirmation) {
        // Actualizar confirmación existente
        const updatePayload: Database["public"]["Tables"]["confirmations"]["Update"] =
          {
            civil_attending: conf.civilAttending,
            party_attending: conf.partyAttending,
            confirmed_by_id: confirmedById,
            group_id: confirmerGuest.group_id,
            updated_at: new Date().toISOString(),
          };

        const { data, error } = await supabase
          .from("confirmations")
          // Supabase type inference limitation: update() no reconoce Database generic
          .update(updatePayload as never)
          .eq("guest_id", conf.guestId)
          .select()
          .single();

        if (error) {
          throw new Error(`Error updating confirmation: ${error.message}`);
        }
        confirmation = data as Confirmation;
      } else {
        // Crear nueva confirmación
        const insertPayload: Database["public"]["Tables"]["confirmations"]["Insert"] =
          {
            guest_id: conf.guestId,
            confirmed_by_id: confirmedById,
            group_id: confirmerGuest.group_id,
            civil_attending: conf.civilAttending,
            party_attending: conf.partyAttending,
          };

        const { data, error } = await supabase
          .from("confirmations")
          // Supabase type inference limitation: insert() no reconoce Database generic
          .insert(insertPayload as never)
          .select()
          .single();

        if (error) {
          throw new Error(`Error creating confirmation: ${error.message}`);
        }
        confirmation = data as Confirmation;
      }

      createdConfirmations.push(confirmation);
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

    if (error instanceof Error && error.message.includes("no encontrado")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * API ROUTE: GET /api/confirmation
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
