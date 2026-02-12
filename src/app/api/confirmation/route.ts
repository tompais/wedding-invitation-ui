import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    const confirmer = await prisma.guest.findUnique({
      where: { id: confirmedById },
      include: { group: true },
    });

    if (!confirmer) {
      return NextResponse.json(
        { error: "Usuario que confirma no encontrado" },
        { status: 404 }
      );
    }

    // Crear confirmaciones en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const createdConfirmations = [];

      for (const conf of confirmations) {
        // Verificar que el invitado exista
        const guest = await tx.guest.findUnique({
          where: { id: conf.guestId },
        });

        if (!guest) {
          throw new Error(`Invitado ${conf.guestId} no encontrado`);
        }

        // Verificar si ya existe confirmación (upsert)
        const confirmation = await tx.confirmation.upsert({
          where: { guestId: conf.guestId },
          update: {
            civilAttending: conf.civilAttending,
            partyAttending: conf.partyAttending,
            confirmedById: confirmedById,
            groupId: confirmer.groupId,
          },
          create: {
            guestId: conf.guestId,
            confirmedById: confirmedById,
            groupId: confirmer.groupId,
            civilAttending: conf.civilAttending,
            partyAttending: conf.partyAttending,
          },
        });

        createdConfirmations.push(confirmation);
      }

      return createdConfirmations;
    });

    return NextResponse.json(
      {
        message: "Confirmación registrada exitosamente",
        confirmations: result,
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
    const totalConfirmations = await prisma.confirmation.count();
    const civilCount = await prisma.confirmation.count({
      where: { civilAttending: true },
    });
    const partyCount = await prisma.confirmation.count({
      where: { partyAttending: true },
    });

    return NextResponse.json({
      total: totalConfirmations,
      civil: civilCount,
      party: partyCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
