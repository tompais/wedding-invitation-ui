import { useState } from "react";
import { sendRSVPConfirmation } from "../utils/api";
import { RSVP_CONFIG } from "../constants/rsvp";
import {
  findGuestByCode,
  getFamilyMembers,
  initializeFamilyConfirmation,
  getConfirmedFamilyMembers,
} from "../services/guest.service";
import {
  prepareAttendanceConfirmation,
  prepareNoAttendanceConfirmation,
} from "../services/rsvp.service";

/**
 * APPLICATION LAYER: RSVP Flow Hook
 *
 * Responsabilidad: Orquestar el flujo de estados del formulario RSVP
 * Principios: SOLID (Single Responsibility), Separation of Concerns
 *
 * Este hook encapsula toda la lógica de negocio del flujo RSVP,
 * delegando responsabilidades específicas a los servicios.
 *
 * @param {Array} guestData - Lista de invitados
 * @returns {Object} - Estado y acciones del flujo RSVP
 */
export const useRSVPFlow = (guestData) => {
  // Estados del flujo
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState("idle"); // idle | submitting | success | error
  const [isNoAttendance, setIsNoAttendance] = useState(false);

  // Datos del invitado
  const [currentGuest, setCurrentGuest] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyConfirm, setFamilyConfirm] = useState({});

  // Selecciones
  const [selectedEvents, setSelectedEvents] = useState([]);

  /**
   * Procesa el código de invitado
   * @param {string} code - Código ingresado
   * @returns {Object} - { success: boolean, error?: string }
   */
  const processGuestCode = (code) => {
    const guest = findGuestByCode(guestData, code);

    if (!guest) {
      return {
        success: false,
        error: RSVP_CONFIG.messages.errors.codeNotFound,
      };
    }

    // Configurar invitado y familia
    setCurrentGuest(guest);
    const family = getFamilyMembers(guestData, guest.codigo);
    setFamilyMembers(family);

    const initialConfirm = initializeFamilyConfirmation(family, guest.codigo);
    setFamilyConfirm(initialConfirm);

    setStep(2);
    return { success: true };
  };

  /**
   * Maneja la decisión de asistencia
   * @param {boolean} willAttend - Si asistirá o no
   */
  const handleAttendanceDecision = (willAttend) => {
    if (willAttend) {
      setStep(4); // Ir a selección de eventos
    } else {
      submitNoAttendance(); // Enviar directamente
    }
  };

  /**
   * Toggle de evento seleccionado
   * @param {string} event - Nombre del evento
   */
  const toggleEvent = (event) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  /**
   * Toggle de miembro de familia
   * @param {string} memberCode - Código del miembro
   * @param {boolean} isConfirmed - Estado de confirmación
   */
  const toggleFamilyMember = (memberCode, isConfirmed) => {
    setFamilyConfirm((prev) => ({
      ...prev,
      [memberCode]: isConfirmed,
    }));
  };

  /**
   * Envía confirmación de no asistencia
   */
  const submitNoAttendance = async () => {
    setFormState("submitting");
    setIsNoAttendance(true);

    try {
      const confirmationData = prepareNoAttendanceConfirmation(currentGuest);
      const result = await sendRSVPConfirmation(confirmationData);

      if (result.success) {
        setFormState("success");
        scheduleReset();
      } else {
        setFormState("error");
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      setFormState("error");
    }
  };

  /**
   * Envía confirmación de asistencia
   */
  const submitAttendance = async () => {
    if (selectedEvents.length === 0) {
      return { success: false, error: RSVP_CONFIG.messages.errors.selectEvent };
    }

    setFormState("submitting");

    try {
      const confirmedMembers = getConfirmedFamilyMembers(
        familyConfirm,
        guestData
      );

      const confirmationData = prepareAttendanceConfirmation({
        currentGuest,
        selectedEvents,
        confirmedMembers,
      });

      const result = await sendRSVPConfirmation(confirmationData);

      if (result.success) {
        setFormState("success");
        scheduleReset();
        return { success: true };
      } else {
        setFormState("error");
        return { success: false };
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      setFormState("error");
      return { success: false };
    }
  };

  /**
   * Programa el reset del formulario después del mensaje de éxito
   */
  const scheduleReset = () => {
    setTimeout(() => {
      resetFlow();
    }, RSVP_CONFIG.successMessageDuration);
  };

  /**
   * Resetea todo el flujo al estado inicial
   */
  const resetFlow = () => {
    setStep(1);
    setCurrentGuest(null);
    setFamilyMembers([]);
    setFamilyConfirm({});
    setSelectedEvents([]);
    setIsNoAttendance(false);
    setFormState("idle");
  };

  /**
   * Navega hacia atrás en los pasos
   */
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  /**
   * Navega hacia adelante en los pasos
   */
  const goForward = () => {
    setStep(step + 1);
  };

  return {
    // Estado
    step,
    formState,
    isNoAttendance,
    currentGuest,
    familyMembers,
    familyConfirm,
    selectedEvents,

    // Acciones
    processGuestCode,
    handleAttendanceDecision,
    toggleEvent,
    toggleFamilyMember,
    submitAttendance,
    submitNoAttendance,
    goBack,
    goForward,
    resetFlow,
  };
};
