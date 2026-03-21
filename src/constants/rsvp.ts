/**
 * CONFIGURACIÓN DEL FORMULARIO RSVP
 *
 * Centraliza textos y configuraciones del sistema de confirmación
 */

import { RSVPStep } from "@/types/RSVPStep";

interface RSVPMessages {
  errors: {
    codeNotFound: string;
    submitting: string;
    error: string;
  };
  success: {
    attendance: {
      title: string;
      subtitle: string;
    };
    noAttendance: {
      title: string;
      subtitle: string;
    };
  };
  expired: {
    title: string;
    subtitle: string;
  };
}

interface RSVPConfig {
  stepIndicators: Record<number, string>;
  messages: RSVPMessages;
  placeholders: {
    code: string;
  };
  successMessageDuration: number;
}

export const RSVP_CONFIG: RSVPConfig = {
  stepIndicators: {
    [RSVPStep.CODE_INPUT]: "Paso 1 de 3",
    [RSVPStep.ATTENDANCE_DECISION]: "Paso 2 de 3",
    [RSVPStep.CONFIRMATION_GRID]: "Paso 3 de 3",
  },

  messages: {
    errors: {
      codeNotFound:
        "Código no encontrado. Verificá el código e intentá de nuevo.",
      submitting: "Enviando tu respuesta...",
      error: "Hubo un error al enviar tu confirmación. Intentá de nuevo.",
    },
    success: {
      attendance: {
        title: "¡Gracias por confirmar!",
        subtitle: "Tu asistencia ha sido registrada",
      },
      noAttendance: {
        title: "Va a ser una pena no tenerte con nosotros 😢",
        subtitle: "¡Ojalá nos reencontremos pronto!",
      },
    },
    expired: {
      title: "Tu invitación venció",
      subtitle: "El plazo para confirmar asistencia ya cerró.",
    },
  },

  placeholders: {
    code: "Ej: 123456",
  },

  // Duración del mensaje de éxito en milisegundos
  successMessageDuration: 4500,
} as const;
