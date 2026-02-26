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
  resetFlow: () => void;
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

    // Verificar si ya fue confirmado
    if (data.confirmation) {
      const confirmedByName = `${data.confirmation.confirmedBy.firstName} ${data.confirmation.confirmedBy.lastName}`;
      return {
        success: false,
        error: `Ya confirmado por ${confirmedByName}`,
      };
    }

    setCurrentGuest(data);

    // Si tiene grupo, cargar miembros
    if (data.group) {
      // La API ya mapea snake_case → camelCase; completamos los campos opcionales con null
      const members: Guest[] = data.group.guests.map((m) => ({
        ...m,
        phone: null,
        group: null,
        confirmation: null,
      }));
      setFamilyMembers(members);

      // Modelo opt-out: todos los miembros arrancan marcados por defecto
      const initialConfirm: Record<string, boolean> = {};
      members.forEach((member) => {
        initialConfirm[member.id] = true;
      });
      setFamilyConfirm(initialConfirm);
    } else {
      setFamilyMembers([data]);
      setFamilyConfirm({ [data.id]: true });
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

  // Resetea todo el flujo al estado inicial
  const resetFlow = () => {
    setStep(RSVPStep.CODE_INPUT);
    setCurrentGuest(null);
    setFamilyMembers([]);
    setFamilyConfirm({});
    setSelectedEvents([]);
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

    // Acciones
    processGuestCode,
    attend,
    toggleEvent,
    toggleFamilyMember,
    goBack,
    goForward,
    resetFlow,
  };
};
