import { useState } from "react";
import { RSVP_CONFIG } from "../constants/rsvp";

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

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  phone?: string | null;
  group?: {
    id: string;
    name: string;
    guests: Array<{
      id: string;
      firstName: string;
      lastName: string;
    }>;
  } | null;
  confirmation?: {
    civilAttending: boolean;
    partyAttending: boolean;
    confirmedBy: {
      id: string;
      firstName: string;
      lastName: string;
    };
    confirmedAt: Date;
  } | null;
}

interface UseRSVPFlowReturn {
  // Estado
  step: number;
  formState: "idle" | "submitting" | "success" | "error";
  isNoAttendance: boolean;
  currentGuest: Guest | null;
  familyMembers: Guest[];
  familyConfirm: Record<string, boolean>;
  selectedEvents: string[];

  // Acciones
  processGuestCode: (
    code: string
  ) => Promise<{ success: boolean; error?: string }>;
  handleAttendanceDecision: (willAttend: boolean) => void;
  toggleEvent: (event: string) => void;
  toggleFamilyMember: (memberId: string, isConfirmed: boolean) => void;
  submitAttendance: () => Promise<{ success: boolean; error?: string }>;
  goBack: () => void;
  goForward: () => void;
  resetFlow: () => void;
}

export const useRSVPFlow = (): UseRSVPFlowReturn => {
  // Estados del flujo
  const [step, setStep] = useState(1);
  const [formState, setFormState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [isNoAttendance, setIsNoAttendance] = useState(false);

  // Datos del invitado
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [familyMembers, setFamilyMembers] = useState<Guest[]>([]);
  const [familyConfirm, setFamilyConfirm] = useState<Record<string, boolean>>(
    {}
  );

  // Selecciones
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  /**
   * Procesa el código de invitado consultando la API
   */
  const processGuestCode = async (code: string) => {
    try {
      const response = await fetch(`/api/guest/${code}`);

      if (!response.ok) {
        return {
          success: false,
          error: RSVP_CONFIG.messages.errors.codeNotFound,
        };
      }

      const data = await response.json();

      // Verificar si ya fue confirmado
      if (data.confirmation) {
        // Ya confirmado por alguien
        const confirmedByName = `${data.confirmation.confirmedBy.firstName} ${data.confirmation.confirmedBy.lastName}`;
        return {
          success: false,
          error: `Ya confirmado por ${confirmedByName}`,
        };
      }

      setCurrentGuest(data);

      // Si tiene grupo, cargar miembros
      if (data.group) {
        setFamilyMembers(data.group.guests);

        // Inicializar confirmación (solo el actual marcado)
        const initialConfirm: Record<string, boolean> = {};
        data.group.guests.forEach((member: Guest) => {
          initialConfirm[member.code] = member.code === data.code;
        });
        setFamilyConfirm(initialConfirm);
      } else {
        setFamilyMembers([data]);
        setFamilyConfirm({ [data.code]: true });
      }

      setStep(2);
      return { success: true };
    } catch (error) {
      console.error("Error al procesar código:", error);
      return {
        success: false,
        error: RSVP_CONFIG.messages.errors.error,
      };
    }
  };

  /**
   * Maneja la decisión de asistencia
   */
  const handleAttendanceDecision = (willAttend: boolean) => {
    if (willAttend) {
      setStep(4); // Ir a selección de eventos
    } else {
      submitNoAttendance(); // Enviar directamente
    }
  };

  /**
   * Toggle de evento seleccionado
   */
  const toggleEvent = (event: string) => {
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

  /**
   * Envía confirmación de no asistencia
   */
  const submitNoAttendance = async () => {
    if (!currentGuest) return;

    setFormState("submitting");
    setIsNoAttendance(true);

    try {
      const response = await fetch("/api/confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmedById: currentGuest.id,
          confirmations: [
            {
              guestId: currentGuest.id,
              civilAttending: false,
              partyAttending: false,
            },
          ],
        }),
      });

      if (response.ok) {
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
    if (!currentGuest || selectedEvents.length === 0) {
      return { success: false, error: RSVP_CONFIG.messages.errors.selectEvent };
    }

    setFormState("submitting");

    try {
      // Preparar confirmaciones para todos los miembros seleccionados
      const confirmations = Object.entries(familyConfirm)
        .filter(([, isConfirmed]) => isConfirmed)
        .map(([guestCode]) => {
          // Buscar el guest por code para obtener su id
          const guest = familyMembers.find((m) => m.code === guestCode);
          return {
            guestId: guest?.id || "",
            civilAttending: selectedEvents.includes("Civil"),
            partyAttending: selectedEvents.includes("Fiesta"),
          };
        });

      const response = await fetch("/api/confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmedById: currentGuest.id,
          confirmations,
        }),
      });

      if (response.ok) {
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
    goBack,
    goForward,
    resetFlow,
  };
};
