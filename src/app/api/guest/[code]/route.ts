import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guestCodeSchema } from "@/schemas/rsvp.schema";

// Marcar como dinámico para que Next.js no lo pre-renderice durante el build
export const dynamic = "force-dynamic";

/**
 * API ROUTE: GET /api/guest/[code]
 *
 * Obtiene un invitado por su código único
 * Incluye: grupo familiar, confirmación previa
 *
 * @param code - Código del invitado (ej: FLIA-GARC-001)
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
    const guest = await prisma.guest.findUnique({
      where: { code: validation.data.code },
      include: {
        group: {
          include: {
            guests: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        confirmationsAsGuest: {
          include: {
            confirmedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          take: 1, // Solo la última confirmación
        },
      },
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Invitado no encontrado" },
        { status: 404 }
      );
    }

    // Formatear respuesta
    const confirmation = guest.confirmationsAsGuest[0];

    return NextResponse.json({
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      code: guest.code,
      phone: guest.phone,
      group: guest.group,
      confirmation: confirmation
        ? {
            civilAttending: confirmation.civilAttending,
            partyAttending: confirmation.partyAttending,
            confirmedBy: confirmation.confirmedBy,
            confirmedAt: confirmation.confirmedAt,
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
