/**
 * RSVP Deadline Utilities
 *
 * Shared helpers for parsing and evaluating the RSVP_DEADLINE env var.
 * Used by both GET /api/guests and POST /api/confirmations to keep
 * deadline logic consistent across routes.
 */

/**
 * Parses RSVP_DEADLINE env var as a UTC-offset-aware timestamp.
 * Returns null if the var is unset or unparseable.
 */
export function getRsvpDeadline(): Date | null {
  const raw = process.env.RSVP_DEADLINE;
  if (!raw) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Returns true if the deadline has passed AND the guest has no prior confirmation.
 * If RSVP_DEADLINE is unset, always returns false (no restriction).
 */
export function computeInvitationExpired(
  deadline: Date | null,
  hasConfirmation: boolean
): boolean {
  if (!deadline) return false;
  return new Date() > deadline && !hasConfirmation;
}
