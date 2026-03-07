import { useState } from "react";
import { RSVP_CONFIG } from "@/constants/rsvp";
import { api } from "@/lib/api";
import type { GuestResponse } from "@/types/api";
import { RSVPStep } from "@/types/RSVPStep";

/**
 * APPLICATION LAYER: RSVP Flow Hook
 *
 * Responsabilidad: Orquestar el flujo de estados del formulario RSVP
 * Principios: SOLID (Single Responsibility), Separation of Concerns
 *
 * El hook encapsula toda la lógica de negocio del flujo RSVP.
 * La grilla de confirmación unifica selección de miembros y eventos
 * en un único paso persona × evento.
 */

// Alias para claridad en el hook
type Guest = GuestResponse;

export type MemberConfirmation = {
  /** Si el miembro está incluido en el submit. El invitado actual siempre es true. */
  checked: boolean;
  /** Asiste a la ceremonia civil */
  civil: boolean;
  /** Asiste a la fiesta */
  fiesta: boolean;
};

interface UseRSVPFlowReturn {
  // Estado
  step: RSVPStep;
  currentGuest: Guest | null;
  memberConfirmations: Record<string, MemberConfirmation>;

  // Acciones
  processGuestCode: (
    code: string
  ) => Promise<{ success: boolean; error?: string }>;
  attend: () => void;
  toggleMemberChecked: (memberId: string) => void;
  setMemberEvent: (
    memberId: string,
    event: "civil" | "fiesta",
    value: boolean
  ) => void;
  goBack: () => void;
  reset: () => void;
}

export const useRSVPFlow = (): UseRSVPFlowReturn => {
  const [step, setStep] = useState(RSVPStep.CODE_INPUT);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [memberConfirmations, setMemberConfirmations] = useState<
    Record<string, MemberConfirmation>
  >({});

  /**
   * Procesa el código de invitado y siempre navega a ATTENDANCE_DECISION.
   * Si ya confirmó, los valores previos se pre-cargan en attend().
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
    setStep(RSVPStep.ATTENDANCE_DECISION);
    return { success: true };
  };

  /**
   * Confirma identidad y navega a la grilla.
   * Inicializa memberConfirmations pre-cargando confirmaciones existentes.
   * - Invitado actual: siempre checked, valores de su confirmación previa o SÍ/SÍ por defecto.
   * - Otros miembros: unchecked por defecto, values pre-cargados al activar el checkbox.
   */
  const attend = () => {
    if (!currentGuest) return;

    const confirmations: Record<string, MemberConfirmation> = {};

    // Invitado actual: siempre incluido, con valores previos o defaults
    confirmations[currentGuest.id] = {
      checked: true,
      civil: currentGuest.confirmation?.civilAttending ?? true,
      fiesta: currentGuest.confirmation?.partyAttending ?? true,
    };

    // Otros miembros del grupo: unchecked, valores previos o defaults SÍ/SÍ
    currentGuest.group?.guests
      .filter((g) => g.id !== currentGuest.id)
      .forEach((member) => {
        confirmations[member.id] = {
          checked: false,
          civil: member.confirmation?.civilAttending ?? true,
          fiesta: member.confirmation?.partyAttending ?? true,
        };
      });

    setMemberConfirmations(confirmations);
    setStep(RSVPStep.CONFIRMATION_GRID);
  };

  /**
   * Activa o desactiva un miembro del grupo en la grilla.
   * Al activar: si tiene confirmación previa, la pre-carga. Si no, mantiene defaults SÍ/SÍ.
   */
  const toggleMemberChecked = (memberId: string) => {
    setMemberConfirmations((prev) => {
      const member = prev[memberId];
      if (!member) return prev;
      const newChecked = !member.checked;

      if (newChecked) {
        const groupMember = currentGuest?.group?.guests.find(
          (g) => g.id === memberId
        );
        if (groupMember?.confirmation) {
          return {
            ...prev,
            [memberId]: {
              checked: true,
              civil: groupMember.confirmation.civilAttending,
              fiesta: groupMember.confirmation.partyAttending,
            },
          };
        }
      }

      return { ...prev, [memberId]: { ...member, checked: newChecked } };
    });
  };

  /**
   * Actualiza la asistencia de un miembro a un evento específico.
   */
  const setMemberEvent = (
    memberId: string,
    event: "civil" | "fiesta",
    value: boolean
  ) => {
    setMemberConfirmations((prev) => ({
      ...prev,
      [memberId]: { ...prev[memberId], [event]: value },
    }));
  };

  const PREV_STEP: Partial<Record<RSVPStep, RSVPStep>> = {
    [RSVPStep.ATTENDANCE_DECISION]: RSVPStep.CODE_INPUT,
    [RSVPStep.CONFIRMATION_GRID]: RSVPStep.ATTENDANCE_DECISION,
  };

  const goBack = () => {
    const prev = PREV_STEP[step];
    if (prev !== undefined) setStep(prev);
  };

  const reset = () => {
    setStep(RSVPStep.CODE_INPUT);
    setCurrentGuest(null);
    setMemberConfirmations({});
  };

  return {
    step,
    currentGuest,
    memberConfirmations,
    processGuestCode,
    attend,
    toggleMemberChecked,
    setMemberEvent,
    goBack,
    reset,
  };
};
