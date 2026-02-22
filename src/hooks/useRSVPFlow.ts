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
      setFamilyMembers(data.group.guests as unknown as Guest[]);

      // Inicializar confirmación (solo el actual marcado)
      const initialConfirm: Record<string, boolean> = {};
      data.group.guests.forEach((member) => {
        // Necesitamos el code de cada miembro, pero solo tenemos id/firstName/lastName
        // Por ahora usamos id como key
        initialConfirm[member.id] = member.id === data.id;
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
   * Toggle de miembro de familia (usa code, no id)
   */
  const toggleFamilyMember = (memberCode: string, isConfirmed: boolean) => {
    setFamilyConfirm((prev) => ({
      ...prev,
      [memberCode]: isConfirmed,
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

  /**
   * Navega hacia atrás en los pasos
   */
  const goBack = () => {
    if (step > RSVPStep.CODE_INPUT) {
      setStep((step - 1) as RSVPStep);
    }
  };

  /**
   * Navega hacia adelante en los pasos
   */
  const goForward = () => {
    setStep((step + 1) as RSVPStep);
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
