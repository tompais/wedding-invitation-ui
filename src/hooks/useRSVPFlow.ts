import { useState } from "react";
import { RSVP_CONFIG } from "@/constants/rsvp";
import { api } from "@/lib/api";
import type { GuestResponse } from "@/types/api";
import { FormState } from "@/types/FormState";
import { EventType } from "@/types/EventType";
import { RSVPStep } from "@/types/RSVPStep";

/**
 * APPLICATION LAYER: RSVP Flow Hook (Next.js Version)
 *
 * Responsabilidad: Orquestar el flujo de estados del formulario RSVP
 * Principios: SOLID (Single Responsibility), Separation of Concerns
 *
 * Este hook encapsula toda la lógica de negocio del flujo RSVP,
 * delegando responsabilidades a las API Routes de Next.js.
 *
 * @returns Estado y acciones del flujo RSVP
 */

// Alias para claridad en el hook
type Guest = GuestResponse;

interface UseRSVPFlowReturn {
  // Estado
  step: RSVPStep;
  formState: FormState;
  isNoAttendance: boolean;
  currentGuest: Guest | null;
  familyMembers: Guest[];
  familyConfirm: Record<string, boolean>;
  selectedEvents: EventType[];
  existingConfirmation: GuestResponse["confirmation"];

  // Acciones
  processGuestCode: (
    code: string
  ) => Promise<{ success: boolean; error?: string }>;
  // handleAttendanceDecision fue reemplazado por attend y decline
  attend: () => void;
  toggleEvent: (event: EventType) => void;
  toggleFamilyMember: (memberId: string, isConfirmed: boolean) => void;
  goBack: () => void;
  goForward: () => void;
  reset: () => void;
  startEditFlow: () => void;
}

export const useRSVPFlow = (): UseRSVPFlowReturn => {
  // Estados del flujo
  const [step, setStep] = useState(RSVPStep.CODE_INPUT);
  const [formState, setFormState] = useState<FormState>(FormState.IDLE);
  const [isNoAttendance, setIsNoAttendance] = useState(false);

  // Datos del invitado
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [familyMembers, setFamilyMembers] = useState<Guest[]>([]);
  const [familyConfirm, setFamilyConfirm] = useState<Record<string, boolean>>(
    {}
  );

  // Selecciones
  const [selectedEvents, setSelectedEvents] = useState<EventType[]>([]);

  // Confirmación previa (si el invitado ya confirmó)
  const [existingConfirmation, setExistingConfirmation] =
    useState<GuestResponse["confirmation"]>(null);

  /**
   * Procesa el código de invitado consultando la API
   */
  const processGuestCode = async (code: string) => {
    const { data, error } = await api.get<GuestResponse>(
      `/api/guests?code=${code}`
    );

    if (error || !data) {
      return {
        success: false,
        error: RSVP_CONFIG.messages.errors.codeNotFound,
      };
    }

    setCurrentGuest(data);

    // Si tiene grupo, cargar miembros (opt-out: todos marcados por defecto)
    const members: Guest[] = data.group
      ? data.group.guests.map((m) => ({
          ...m,
          phone: null,
          group: null,
          confirmation: null,
        }))
      : [data];
    setFamilyMembers(members);
    const initialConfirm: Record<string, boolean> = {};
    members.forEach((m) => {
      initialConfirm[m.id] = true;
    });
    setFamilyConfirm(initialConfirm);

    // Si ya fue confirmado: mostrar resumen con opción de editar
    if (data.confirmation) {
      setExistingConfirmation(data.confirmation);

      const preSelectedEvents: EventType[] = [];
      if (data.confirmation.civilAttending)
        preSelectedEvents.push(EventType.CIVIL);
      if (data.confirmation.partyAttending)
        preSelectedEvents.push(EventType.FIESTA);
      setSelectedEvents(preSelectedEvents);

      setStep(RSVPStep.ALREADY_CONFIRMED);
      return { success: true };
    }

    setStep(RSVPStep.ATTENDANCE_DECISION);
    return { success: true };
  };

  /**
   * Maneja la decisión de asistencia
   */
  const attend = () => setStep(RSVPStep.EVENT_SELECTION);

  /**
   * Toggle de evento seleccionado
   */
  const toggleEvent = (event: EventType) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  /**
   * Toggle de miembro de familia (usa id como clave)
   */
  const toggleFamilyMember = (memberId: string, isConfirmed: boolean) => {
    setFamilyConfirm((prev) => ({
      ...prev,
      [memberId]: isConfirmed,
    }));
  };

  // Avanza al flujo de edición desde la vista de confirmación existente
  const startEditFlow = () => setStep(RSVPStep.FAMILY_CONFIRMATION);

  // Resetea todo el flujo al estado inicial
  const reset = () => {
    setStep(RSVPStep.CODE_INPUT);
    setCurrentGuest(null);
    setFamilyMembers([]);
    setFamilyConfirm({});
    setSelectedEvents([]);
    setExistingConfirmation(null);
    setIsNoAttendance(false);
    setFormState(FormState.IDLE);
  };

  // Mapeo explícito de pasos para evitar aritmética con cast inseguro
  const PREV_STEP: Partial<Record<RSVPStep, RSVPStep>> = {
    [RSVPStep.ATTENDANCE_DECISION]: RSVPStep.CODE_INPUT,
    [RSVPStep.FAMILY_CONFIRMATION]: RSVPStep.ATTENDANCE_DECISION,
    [RSVPStep.EVENT_SELECTION]: RSVPStep.FAMILY_CONFIRMATION,
    [RSVPStep.CONFIRMATION]: RSVPStep.EVENT_SELECTION,
  };

  const NEXT_STEP: Partial<Record<RSVPStep, RSVPStep>> = {
    [RSVPStep.CODE_INPUT]: RSVPStep.ATTENDANCE_DECISION,
    [RSVPStep.ATTENDANCE_DECISION]: RSVPStep.FAMILY_CONFIRMATION,
    [RSVPStep.FAMILY_CONFIRMATION]: RSVPStep.EVENT_SELECTION,
    [RSVPStep.EVENT_SELECTION]: RSVPStep.CONFIRMATION,
  };

  /**
   * Navega hacia atrás en los pasos
   */
  const goBack = () => {
    const prev = PREV_STEP[step];
    if (prev !== undefined) {
      setStep(prev);
    }
  };

  /**
   * Navega hacia adelante en los pasos
   */
  const goForward = () => {
    const next = NEXT_STEP[step];
    if (next !== undefined) {
      setStep(next);
    }
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
    existingConfirmation,

    // Acciones
    processGuestCode,
    attend,
    toggleEvent,
    toggleFamilyMember,
    goBack,
    goForward,
    reset,
    startEditFlow,
  };
};
