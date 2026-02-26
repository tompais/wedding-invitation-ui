/**
 * Tipos para las respuestas de la API
 *
 * Principios: Single Source of Truth para tipos de API
 */

// Respuesta de GET /api/guests?code=...
export interface GuestResponse {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  phone: string | null;
  group: {
    id: string;
    name: string;
    guests: Array<{
      id: string;
      firstName: string;
      lastName: string;
      code: string;
    }>;
  } | null;
  confirmation: {
    civilAttending: boolean;
    partyAttending: boolean;
    confirmedBy: {
      id: string;
      firstName: string;
      lastName: string;
    };
    confirmedAt: string;
  } | null;
}

// Request body para POST /api/confirmation
export interface ConfirmationRequest {
  confirmedById: string;
  confirmations: Array<{
    guestId: string;
    civilAttending: boolean;
    partyAttending: boolean;
  }>;
}

// Respuesta de POST /api/confirmation
export interface ConfirmationResponse {
  success: boolean;
  message: string;
  count: number;
}
