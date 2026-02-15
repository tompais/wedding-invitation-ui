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

export type ConfirmationInsert =
  Database["public"]["Tables"]["confirmations"]["Insert"];

// ============================================================================
// UPDATE TYPES (para actualizar registros)
// ============================================================================

export type ConfirmationUpdate =
  Database["public"]["Tables"]["confirmations"]["Update"];

// ============================================================================
// CUSTOM TYPES (para DTOs y lógica de aplicación)
// ============================================================================
