/**
 * DOMAIN LAYER: RSVP Service
 *
 * Responsabilidad única: Preparar datos para envío de confirmación
 * Principios: SOLID (Single Responsibility), Clean Architecture
 *
 * Este servicio se encarga de transformar los datos del formulario
 * en el formato esperado por la API/Formspree.
 */

/**
 * Prepara los datos de confirmación de asistencia
 * @param {Object} params - Parámetros de confirmación
 * @param {Object} params.currentGuest - Invitado principal
 * @param {Array} params.selectedEvents - Eventos seleccionados
 * @param {Array} params.confirmedMembers - Miembros confirmados
 * @returns {Object} - Datos formateados para envío
 */
export const prepareAttendanceConfirmation = ({
  currentGuest,
  selectedEvents,
  confirmedMembers,
}) => {
  return {
    codigoPrincipal: currentGuest.codigo,
    nombrePrincipal: `${currentGuest.nombre} ${currentGuest.apellido}`,
    asistencia: "Confirma asistencia",
    eventos: selectedEvents.join(", "),
    grupoFamiliar: confirmedMembers
      .map((m) => `${m.nombre} ${m.apellido}`)
      .join(", "),
    totalPersonas: confirmedMembers.length,
  };
};

/**
 * Prepara los datos de no asistencia
 * @param {Object} currentGuest - Invitado principal
 * @returns {Object} - Datos formateados para envío
 */
export const prepareNoAttendanceConfirmation = (currentGuest) => {
  return {
    codigoPrincipal: currentGuest.codigo,
    nombrePrincipal: `${currentGuest.nombre} ${currentGuest.apellido}`,
    asistencia: "No va a poder asistir",
    eventos: "N/A",
    grupoFamiliar: "N/A",
    totalPersonas: 0,
  };
};
