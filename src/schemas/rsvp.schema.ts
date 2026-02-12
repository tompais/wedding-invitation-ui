import { z } from "zod";

/**
 * DOMAIN LAYER: Validation Schemas
 *
 * Responsabilidad única: Definir las reglas de validación de negocio
 * Principios: SOLID (Single Responsibility), DRY (reutilización de schemas)
 */

// ============================================================================
// GUEST SCHEMAS
// ============================================================================

/**
 * Schema para crear un invitado
 */
export const createGuestSchema = z.object({
  firstName: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .trim(),
  lastName: z
    .string()
    .min(1, "El apellido es requerido")
    .max(50, "El apellido no puede exceder 50 caracteres")
    .trim(),
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Formato de teléfono inválido (usar formato internacional: +54 11 1234-5678)"
    )
    .optional()
    .nullable(),
  code: z
    .string()
    .regex(/^\d{6}$/, "El código debe ser numérico de 6 dígitos")
    .length(6, "El código debe tener exactamente 6 dígitos"),
  groupId: z.string().uuid("ID de grupo inválido").optional().nullable(),
});

/**
 * Schema para buscar invitado por código
 */
export const guestCodeSchema = z.object({
  code: z
    .string()
    .min(1, "El código es requerido")
    .regex(/^\d{6}$/, "El código debe ser numérico de 6 dígitos")
    .length(6, "El código debe tener exactamente 6 dígitos"),
});

// ============================================================================
// GROUP SCHEMAS
// ============================================================================

/**
 * Schema para crear un grupo familiar
 */
export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre del grupo debe tener al menos 3 caracteres")
    .max(100, "El nombre del grupo no puede exceder 100 caracteres")
    .trim(),
});

// ============================================================================
// CONFIRMATION SCHEMAS
// ============================================================================

/**
 * Schema para confirmación individual
 */
export const confirmationSchema = z.object({
  guestId: z.string().uuid("ID de invitado inválido"),
  civilAttending: z.boolean().default(false),
  partyAttending: z.boolean().default(false),
});

/**
 * Schema para confirmación grupal
 */
export const groupConfirmationSchema = z.object({
  confirmedById: z
    .string()
    .uuid("ID de quien confirma es inválido")
    .describe("ID del invitado que está confirmando"),
  confirmations: z
    .array(confirmationSchema)
    .min(1, "Debe confirmar al menos un invitado")
    .refine(
      (confirmations) =>
        confirmations.some((c) => c.civilAttending || c.partyAttending),
      {
        message: "Al menos un invitado debe asistir a algún evento",
      }
    ),
});

/**
 * Schema para eventos seleccionados (legacy compatibility)
 */
export const eventsSelectionSchema = z.object({
  events: z
    .array(z.enum(["Civil", "Fiesta"]))
    .min(1, "Debes seleccionar al menos un evento"),
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

/**
 * Schema de respuesta para invitado con grupo
 */
export const guestWithGroupResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  code: z.string(),
  phone: z.string().nullable(),
  group: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      guests: z.array(
        z.object({
          id: z.string().uuid(),
          firstName: z.string(),
          lastName: z.string(),
        })
      ),
    })
    .nullable(),
  confirmation: z
    .object({
      civilAttending: z.boolean(),
      partyAttending: z.boolean(),
      confirmedBy: z.object({
        id: z.string().uuid(),
        firstName: z.string(),
        lastName: z.string(),
      }),
      confirmedAt: z.date(),
    })
    .nullable(),
});

// ============================================================================
// TYPESCRIPT TYPES (inferidos de schemas)
// ============================================================================

export type CreateGuest = z.infer<typeof createGuestSchema>;
export type GuestCode = z.infer<typeof guestCodeSchema>;
export type CreateGroup = z.infer<typeof createGroupSchema>;
export type Confirmation = z.infer<typeof confirmationSchema>;
export type GroupConfirmation = z.infer<typeof groupConfirmationSchema>;
export type EventsSelection = z.infer<typeof eventsSelectionSchema>;
export type GuestWithGroupResponse = z.infer<
  typeof guestWithGroupResponseSchema
>;
