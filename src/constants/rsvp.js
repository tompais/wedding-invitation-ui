/**
 * CONFIGURACIÓN DEL FORMULARIO RSVP
 *
 * Centraliza textos y configuraciones del sistema de confirmación
 */

export const RSVP_CONFIG = {
  formspreeUrl: "https://formspree.io/f/mnjvnyze",

  stepIndicators: {
    1: "Paso 1 de 5",
    2: "Paso 2 de 5",
    3: "Paso 3 de 5",
    4: "Paso 4 de 5",
    5: "Paso 5 de 5",
  },

  messages: {
    errors: {
      codeNotFound:
        "Código no encontrado. Verificá el código e intentá de nuevo.",
      selectEvent: "Por favor selecciona al menos un evento",
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
  },

  placeholders: {
    code: "Ej: XXXX-ABC-000",
  },

  // Duración del mensaje de éxito en milisegundos
  successMessageDuration: 4500,
};
