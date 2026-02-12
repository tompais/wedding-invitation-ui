import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { groupConfirmationSchema } from "@/schemas/rsvp.schema";

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

    // Type assertion to work around Supabase type inference issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const confirmerData = confirmer as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdConfirmations: any[] = [];

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
        const { data, error } = await supabase
          .from("confirmations")
          // @ts-expect-error - Supabase client type inference issue
          .update({
            civil_attending: conf.civilAttending,
            party_attending: conf.partyAttending,
            confirmed_by_id: confirmedById,
            group_id: confirmerData.group_id,
            updated_at: new Date().toISOString(),
          })
          .eq("guest_id", conf.guestId)
          .select()
          .single();

        if (error) {
          throw new Error(`Error updating confirmation: ${error.message}`);
        }
        confirmation = data;
      } else {
        // Crear nueva confirmación
        const { data, error } = await supabase
          .from("confirmations")
          // @ts-expect-error - Supabase client type inference issue
          .insert({
            guest_id: conf.guestId,
            confirmed_by_id: confirmedById,
            group_id: confirmerData.group_id,
            civil_attending: conf.civilAttending,
            party_attending: conf.partyAttending,
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Error creating confirmation: ${error.message}`);
        }
        confirmation = data;
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
