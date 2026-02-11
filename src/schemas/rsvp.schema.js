import { z } from "zod";

/**
 * DOMAIN LAYER: Validation Schemas
 *
 * Responsabilidad única: Definir las reglas de validación de negocio
 * Principios: SOLID (Single Responsibility), DRY (reutilización de schemas)
 */

// Schema para el código de invitado
export const guestCodeSchema = z.object({
  code: z
    .string()
    .min(1, "El código es requerido")
    .regex(/^[A-Z]{4}-[A-Z]+-\d{3}$/, "Formato inválido. Debe ser XXXX-ABC-000")
    .transform((val) => val.toUpperCase()),
});

// Schema para selección de eventos
export const eventsSelectionSchema = z.object({
  events: z
    .array(z.enum(["Civil", "Fiesta"]))
    .min(1, "Debes seleccionar al menos un evento"),
});

// Schema para confirmación de familia
export const familyConfirmationSchema = z.object({
  familyMembers: z.record(z.string(), z.boolean()),
});

// Schema combinado para el flujo completo de RSVP
export const rsvpFlowSchema = z.object({
  code: z.string().min(1),
  willAttend: z.boolean(),
  selectedEvents: z.array(z.string()).optional(),
  familyConfirmation: z.record(z.string(), z.boolean()).optional(),
});

// Nota: Los types comentados están disponibles si migramos a TypeScript en el futuro
// export type GuestCodeForm = z.infer<typeof guestCodeSchema>;
// export type EventsSelectionForm = z.infer<typeof eventsSelectionSchema>;
// export type FamilyConfirmationForm = z.infer<typeof familyConfirmationSchema>;
// export type RSVPFlowForm = z.infer<typeof rsvpFlowSchema>;
