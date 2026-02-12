/**
 * Database Type Helpers
 *
 * Exports convenientes para usar los tipos de Supabase generados automáticamente.
 * Estos tipos son generados desde el schema real de la base de datos.
 *
 * Para regenerar tipos después de cambios en el schema:
 * ```bash
 * npm run types
 * ```
 */

import type { Database } from "./supabase";

// ============================================================================
// TABLE ROW TYPES (para datos que vienen de la DB)
// ============================================================================

export type Guest = Database["public"]["Tables"]["guests"]["Row"];
export type Group = Database["public"]["Tables"]["groups"]["Row"];
export type Confirmation = Database["public"]["Tables"]["confirmations"]["Row"];

// ============================================================================
// INSERT TYPES (para crear nuevos registros)
// ============================================================================

export type GuestInsert = Database["public"]["Tables"]["guests"]["Insert"];
export type GroupInsert = Database["public"]["Tables"]["groups"]["Insert"];
export type ConfirmationInsert =
  Database["public"]["Tables"]["confirmations"]["Insert"];

// ============================================================================
// UPDATE TYPES (para actualizar registros)
// ============================================================================

export type GuestUpdate = Database["public"]["Tables"]["guests"]["Update"];
export type GroupUpdate = Database["public"]["Tables"]["groups"]["Update"];
export type ConfirmationUpdate =
  Database["public"]["Tables"]["confirmations"]["Update"];

// ============================================================================
// CUSTOM TYPES (para DTOs y lógica de aplicación)
// ============================================================================

/**
 * Guest con datos expandidos (incluye grupo y confirmación)
 * Usado en API responses
 */
export interface GuestWithRelations extends Guest {
  group?: {
    id: string;
    name: string;
    guests: Array<Pick<Guest, "id" | "first_name" | "last_name">>;
  } | null;
  confirmation?: {
    civil_attending: boolean;
    party_attending: boolean;
    confirmed_by: Pick<Guest, "id" | "first_name" | "last_name">;
    confirmed_at: string;
  } | null;
}

/**
 * Confirmation con usuario que confirmó (para joins)
 */
export interface ConfirmationWithConfirmer extends Confirmation {
  confirmed_by: Pick<Guest, "id" | "first_name" | "last_name">;
}
