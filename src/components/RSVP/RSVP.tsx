"use client";

import type { ActionState } from "@/types/ActionState";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useRSVPFlow } from "@/hooks/useRSVPFlow";
import { RSVP_CONFIG } from "@/constants/rsvp";
import { EVENTS } from "@/constants/events";
import { guestCodeSchema } from "@/schemas/rsvp.schema";
import Loading from "../common/Loading/Loading";
import { EventType } from "@/types/EventType";
import { FormState } from "@/types/FormState";
import { LoadingSize } from "@/types/LoadingSize";
import { RSVPStep } from "@/types/RSVPStep";
import { useActionState, useState } from "react";
import { confirmAttendanceAction } from "@/app/actions/rsvpActions";
import { SubmitButton } from "@/components/common/SubmitButton/SubmitButton";

/**
 * PRESENTATION LAYER: RSVP Component
 *
 * Responsabilidad: Renderizar UI del formulario RSVP
 * Principios: SOLID (Single Responsibility), Separation of Concerns
 *
 * La lógica de negocio está delegada a:
 * - useRSVPFlow: Orquestación del flujo
 * - Servicios: Lógica de dominio
 * - Schemas: Validación
 */
function RSVP() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  // Hook de flujo RSVP (lógica de negocio)
  const {
    step,
    formState,
    currentGuest,
    familyMembers,
    familyConfirm,
    selectedEvents,
    existingConfirmation,
    processGuestCode,
    toggleEvent,
    toggleFamilyMember,
    goBack,
    goForward,
    reset,
    startEditFlow,
  } = useRSVPFlow();

  // React Hook Form para el paso 1 (código)
  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    setError,
  } = useForm({
    resolver: zodResolver(guestCodeSchema),
    mode: "onSubmit",
  });

  /**
   * Handler del formulario de código
   */
  const onCodeSubmit = async (data: { code: string }) => {
    const result = await processGuestCode(data.code);

    if (!result.success) {
      setError("code", {
        type: "manual",
        message: result.error,
      });
    }
  };

  // useActionState para el submit final
  const [submitState, formAction, submitPending] = useActionState(
    async (prevState: ActionState, formData: FormData) =>
      await confirmAttendanceAction(prevState, formData),
    { success: false, error: null }
  );
  // useActionState para el submit de no asistencia
  const [noAttendState, noAttendAction, noAttendPending] = useActionState(
    async (prevState: ActionState, formData: FormData) =>
      await confirmAttendanceAction(prevState, formData),
    { success: false, error: null }
  );

  // Controla la visibilidad del overlay de éxito de forma independiente de
  // useActionState (cuyo estado persiste incluso después de reset()).
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successIsNoAttend, setSuccessIsNoAttend] = useState(false);

  // Detecta la transición pending → completado durante el render (patrón
  // documentado por React para ajustar estado en base a estado previo).
  // Ver: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const isPending = submitPending || noAttendPending;
  const [prevPending, setPrevPending] = useState(isPending);
  if (prevPending !== isPending) {
    setPrevPending(isPending);
    if (prevPending && !isPending) {
      if (noAttendState.success) {
        setSuccessIsNoAttend(true);
        setShowSuccessOverlay(true);
      } else if (submitState.success) {
        setSuccessIsNoAttend(false);
        setShowSuccessOverlay(true);
      }
    }
  }

  const handleReset = () => {
    setShowSuccessOverlay(false);
    reset();
  };

  /**
   * Handler para envío final (ahora usa server action)
   */

  // Shared styles for form containers
  const formContainerStyles =
    "max-w-full rounded-2xl border px-8 py-8 text-left shadow-[0_10px_30px_rgba(0,0,0,0.25)] md:px-6";
  const formHeadingStyles =
    "mb-6 text-center font-display text-2xl md:mb-4 md:text-xl";
  const inputStyles =
    "w-full rounded-lg border-2 px-4 py-3.5 font-body text-base outline-none transition-all duration-300";
  const buttonBaseStyles =
    "flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-lg border-none px-3 py-3 text-base font-semibold transition-all duration-300";
  const checkboxLabelStyles =
    "flex cursor-pointer items-center gap-3 rounded-lg border-2 border-transparent px-3 py-3 transition-all duration-200 hover:border-[rgba(250,240,230,0.3)]";

  return (
    <section
      className="w-full px-8 py-16 text-center md:px-5"
      style={{
        backgroundColor: "var(--bourdeaux)",
        color: "var(--text-light)",
      }}
      ref={ref}
    >
      {/* Loading overlay durante el envío */}
      {formState === FormState.SUBMITTING && (
        <Loading
          size={LoadingSize.LARGE}
          message={RSVP_CONFIG.messages.errors.submitting}
          overlay={true}
        />
      )}

      <div className="mx-auto max-w-125">
        <motion.h2
          className="font-display mb-4 text-4xl font-semibold tracking-[0.02em] md:mb-3 md:text-3xl"
          style={{ color: "var(--hueso)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Confirmación de asistencia
        </motion.h2>

        <motion.p
          className="font-body mx-auto mb-8 max-w-150 text-base leading-relaxed opacity-90"
          style={{ color: "var(--text-light)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Completá tu confirmación siguiendo los pasos
        </motion.p>

        <AnimatePresence mode="wait">
          {/* PASO 1: Ingresar código */}
          {step === RSVPStep.CODE_INPUT && !showSuccessOverlay && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={formContainerStyles}
              style={{
                backgroundColor: "rgba(250, 240, 230, 0.1)",
                borderColor: "rgba(250, 240, 230, 0.2)",
              }}
            >
              <div className="mb-4 text-sm tracking-widest uppercase">
                {RSVP_CONFIG.stepIndicators[1]}
              </div>
              <h3
                className={formHeadingStyles}
                style={{ color: "var(--hueso)" }}
              >
                Ingresá tu código de invitado
              </h3>
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onCodeSubmit)}
              >
                <input
                  type="text"
                  placeholder={RSVP_CONFIG.placeholders.code}
                  className={inputStyles}
                  style={{
                    borderColor: "rgba(250, 240, 230, 0.3)",
                    backgroundColor: "rgba(250, 240, 230, 0.15)",
                    color: "var(--hueso)",
                  }}
                  {...register("code", {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                  disabled={formState === FormState.SUBMITTING}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--hueso)";
                    e.currentTarget.style.backgroundColor =
                      "rgba(250, 240, 230, 0.25)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 4px rgba(250, 240, 230, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(250, 240, 230, 0.3)";
                    e.currentTarget.style.backgroundColor =
                      "rgba(250, 240, 230, 0.15)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {formErrors.code && (
                  <span className="mt-2 block text-center text-sm font-normal text-[#ff6b6b]">
                    {formErrors.code.message}
                  </span>
                )}
                <button
                  type="submit"
                  className={`${buttonBaseStyles} w-full`}
                  style={{
                    backgroundColor: "var(--hueso)",
                    color: "var(--bourdeaux-dark)",
                  }}
                  disabled={formState === FormState.SUBMITTING}
                  onMouseEnter={(e) => {
                    if (formState !== FormState.SUBMITTING) {
                      e.currentTarget.style.backgroundColor =
                        "var(--hueso-dark)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 16px rgba(0, 0, 0, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--hueso)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Continuar
                </button>
              </form>
            </motion.div>
          )}

          {/* PASO 2: Confirmar identidad */}
          {step === RSVPStep.ATTENDANCE_DECISION &&
            currentGuest &&
            !showSuccessOverlay && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className={formContainerStyles}
                style={{
                  backgroundColor: "rgba(250, 240, 230, 0.1)",
                  borderColor: "rgba(250, 240, 230, 0.2)",
                }}
              >
                <div className="mb-4 text-sm tracking-widest uppercase">
                  {RSVP_CONFIG.stepIndicators[2]}
                </div>
                <h3
                  className={formHeadingStyles}
                  style={{ color: "var(--hueso)" }}
                >
                  Confirmá tu identidad
                </h3>
                <div
                  className="mb-6 rounded-xl border px-6 py-6 text-center md:mb-5 md:px-5"
                  style={{
                    background: "rgba(250, 240, 230, 0.08)",
                    borderColor: "rgba(250, 240, 230, 0.2)",
                  }}
                >
                  <p
                    className="mb-2 text-2xl font-semibold md:text-xl"
                    style={{ color: "var(--hueso)" }}
                  >
                    {currentGuest.firstName} {currentGuest.lastName}
                  </p>
                </div>
                <div className="mt-6 flex justify-center gap-3 md:gap-2.5">
                  <button
                    onClick={goBack}
                    className={`${buttonBaseStyles} flex-1`}
                    style={{
                      backgroundColor: "transparent",
                      borderWidth: "2px",
                      borderColor: "var(--hueso)",
                      color: "var(--hueso)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--hueso)";
                      e.currentTarget.style.color = "var(--bourdeaux)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--hueso)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Atrás
                  </button>
                  <button
                    onClick={goForward}
                    className={`${buttonBaseStyles} flex-1`}
                    style={{
                      backgroundColor: "var(--hueso)",
                      color: "var(--bourdeaux-dark)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--hueso-dark)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(250, 240, 230, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--hueso)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Soy yo!
                  </button>
                </div>
              </motion.div>
            )}

          {/* PASO 3: Vista del grupo — quiénes asisten */}
          {step === RSVPStep.FAMILY_CONFIRMATION &&
            currentGuest &&
            !showSuccessOverlay && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className={formContainerStyles}
                style={{
                  backgroundColor: "rgba(250, 240, 230, 0.1)",
                  borderColor: "rgba(250, 240, 230, 0.2)",
                }}
              >
                <div className="mb-4 text-sm tracking-widest uppercase">
                  {RSVP_CONFIG.stepIndicators[3]}
                </div>
                <h3
                  className={formHeadingStyles}
                  style={{ color: "var(--hueso)" }}
                >
                  ¿Quiénes del grupo pueden acompañarnos?
                </h3>

                <div className="mb-6 flex flex-col gap-3">
                  {[
                    ...familyMembers.filter((m) => m.id === currentGuest.id),
                    ...familyMembers.filter((m) => m.id !== currentGuest.id),
                  ].map((member) => {
                    const isCurrentGuest = member.id === currentGuest.id;
                    return (
                      <label
                        key={member.id}
                        className={`${checkboxLabelStyles} ${isCurrentGuest ? "cursor-default" : ""}`}
                        style={{ backgroundColor: "rgba(250, 240, 230, 0.08)" }}
                        onMouseEnter={(e) => {
                          if (!isCurrentGuest) {
                            e.currentTarget.style.backgroundColor =
                              "rgba(250, 240, 230, 0.15)";
                            e.currentTarget.style.borderColor =
                              "rgba(250, 240, 230, 0.3)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(250, 240, 230, 0.08)";
                          e.currentTarget.style.borderColor = "transparent";
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={familyConfirm[member.id] ?? false}
                          onChange={(e) =>
                            toggleFamilyMember(member.id, e.target.checked)
                          }
                          disabled={isCurrentGuest}
                          className={`h-5 w-5 accent-(--hueso) ${isCurrentGuest ? "cursor-default" : "cursor-pointer"}`}
                        />
                        <span
                          className="flex-1 text-base"
                          style={{ color: "var(--text-light)" }}
                        >
                          {member.firstName} {member.lastName}
                          {isCurrentGuest && (
                            <span
                              className="ml-2 text-sm opacity-60"
                              style={{ color: "var(--hueso)" }}
                            >
                              (vos)
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3">
                  <form action={noAttendAction} className="w-full">
                    <input
                      type="hidden"
                      name="confirmedById"
                      value={currentGuest.id}
                    />
                    <input
                      type="hidden"
                      name="confirmations"
                      value={JSON.stringify(
                        familyMembers.map((m) => ({
                          guestId: m.id,
                          civilAttending: false,
                          partyAttending: false,
                        }))
                      )}
                    />
                    <SubmitButton
                      label="No podemos asistir"
                      variant="outline"
                      className={`${buttonBaseStyles} w-full`}
                    />
                    {noAttendState.error && (
                      <span className="mt-2 block text-center text-sm font-normal text-[#ff6b6b]">
                        {noAttendState.error}
                      </span>
                    )}
                  </form>

                  <div className="flex gap-3">
                    <button
                      onClick={goBack}
                      className={`${buttonBaseStyles} flex-1`}
                      style={{
                        backgroundColor: "transparent",
                        borderWidth: "2px",
                        borderColor: "var(--hueso)",
                        color: "var(--hueso)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--hueso)";
                        e.currentTarget.style.color = "var(--bourdeaux)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--hueso)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Atrás
                    </button>
                    <button
                      onClick={goForward}
                      disabled={!Object.values(familyConfirm).some(Boolean)}
                      className={`${buttonBaseStyles} flex-1`}
                      style={{
                        backgroundColor: "var(--hueso)",
                        color: "var(--bourdeaux-dark)",
                        opacity: !Object.values(familyConfirm).some(Boolean)
                          ? "0.5"
                          : "1",
                        cursor: !Object.values(familyConfirm).some(Boolean)
                          ? "not-allowed"
                          : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (Object.values(familyConfirm).some(Boolean)) {
                          e.currentTarget.style.backgroundColor =
                            "var(--hueso-dark)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(250, 240, 230, 0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--hueso)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      Continuar →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          {/* PASO 4: Seleccionar eventos */}
          {step === RSVPStep.EVENT_SELECTION && !showSuccessOverlay && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={formContainerStyles}
              style={{
                backgroundColor: "rgba(250, 240, 230, 0.1)",
                borderColor: "rgba(250, 240, 230, 0.2)",
              }}
            >
              <div className="mb-4 text-sm tracking-widest uppercase">
                {RSVP_CONFIG.stepIndicators[4]}
              </div>
              <h3
                className={formHeadingStyles}
                style={{ color: "var(--hueso)" }}
              >
                ¿A cuál de los eventos asistís?
              </h3>

              <div className="mb-6 flex flex-col gap-3">
                <label
                  className={checkboxLabelStyles}
                  style={{
                    backgroundColor: "rgba(250, 240, 230, 0.08)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(250, 240, 230, 0.15)";
                    e.currentTarget.style.borderColor =
                      "rgba(250, 240, 230, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(250, 240, 230, 0.08)";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(EventType.CIVIL)}
                    onChange={() => toggleEvent(EventType.CIVIL)}
                    className="h-5 w-5 cursor-pointer accent-(--hueso)"
                  />
                  <span
                    className="flex-1 text-base"
                    style={{ color: "var(--text-light)" }}
                  >
                    Ceremonia Civil
                  </span>
                </label>
                <label
                  className={checkboxLabelStyles}
                  style={{
                    backgroundColor: "rgba(250, 240, 230, 0.08)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(250, 240, 230, 0.15)";
                    e.currentTarget.style.borderColor =
                      "rgba(250, 240, 230, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(250, 240, 230, 0.08)";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(EventType.FIESTA)}
                    onChange={() => toggleEvent(EventType.FIESTA)}
                    className="h-5 w-5 cursor-pointer accent-(--hueso)"
                  />
                  <span
                    className="flex-1 text-base"
                    style={{ color: "var(--text-light)" }}
                  >
                    Fiesta
                  </span>
                </label>
              </div>

              <div className="mt-6 flex justify-center gap-3 md:gap-2.5">
                <button
                  onClick={goBack}
                  className={`${buttonBaseStyles} flex-1`}
                  style={{
                    backgroundColor: "transparent",
                    borderWidth: "2px",
                    borderColor: "var(--hueso)",
                    color: "var(--hueso)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--hueso)";
                    e.currentTarget.style.color = "var(--bourdeaux)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--hueso)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Atrás
                </button>
                <button
                  onClick={goForward}
                  className={`${buttonBaseStyles} flex-1`}
                  disabled={selectedEvents.length === 0}
                  style={{
                    backgroundColor: "var(--hueso)",
                    color: "var(--bourdeaux-dark)",
                    opacity: selectedEvents.length === 0 ? "0.5" : "1",
                    cursor:
                      selectedEvents.length === 0 ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedEvents.length > 0) {
                      e.currentTarget.style.backgroundColor =
                        "var(--hueso-dark)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(250, 240, 230, 0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--hueso)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 5: Resumen y confirmación final */}
          {step === RSVPStep.CONFIRMATION && !showSuccessOverlay && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={formContainerStyles}
              style={{
                backgroundColor: "rgba(250, 240, 230, 0.1)",
                borderColor: "rgba(250, 240, 230, 0.2)",
              }}
            >
              <div className="mb-4 text-sm tracking-widest uppercase">
                {RSVP_CONFIG.stepIndicators[5]}
              </div>
              <h3
                className={formHeadingStyles}
                style={{ color: "var(--hueso)" }}
              >
                Confirmá tu asistencia
              </h3>

              {/* Resumen: quiénes asisten */}
              <div
                className="mb-4 rounded-xl border px-5 py-4"
                style={{
                  background: "rgba(250, 240, 230, 0.08)",
                  borderColor: "rgba(250, 240, 230, 0.2)",
                }}
              >
                <p
                  className="mb-2 text-sm tracking-widest uppercase opacity-70"
                  style={{ color: "var(--text-light)" }}
                >
                  Confirmando asistencia:
                </p>
                <ul className="flex flex-col gap-1">
                  {familyMembers
                    .filter((m) => familyConfirm[m.id])
                    .map((m) => (
                      <li
                        key={m.id}
                        className="text-base"
                        style={{ color: "var(--hueso)" }}
                      >
                        • {m.firstName} {m.lastName}
                      </li>
                    ))}
                </ul>
              </div>

              {/* Resumen: eventos seleccionados */}
              <div
                className="mb-6 rounded-xl border px-5 py-4"
                style={{
                  background: "rgba(250, 240, 230, 0.08)",
                  borderColor: "rgba(250, 240, 230, 0.2)",
                }}
              >
                <p
                  className="mb-2 text-sm tracking-widest uppercase opacity-70"
                  style={{ color: "var(--text-light)" }}
                >
                  Eventos:
                </p>
                <ul className="flex flex-col gap-1">
                  {selectedEvents.includes(EventType.CIVIL) && (
                    <li className="text-base" style={{ color: "var(--hueso)" }}>
                      • Ceremonia Civil — {EVENTS.civil.date}
                    </li>
                  )}
                  {selectedEvents.includes(EventType.FIESTA) && (
                    <li className="text-base" style={{ color: "var(--hueso)" }}>
                      • Fiesta — {EVENTS.fiesta.date}
                    </li>
                  )}
                </ul>
              </div>

              <form action={formAction} className="flex flex-col gap-3">
                <input
                  type="hidden"
                  name="confirmedById"
                  value={currentGuest?.id || ""}
                />
                <input
                  type="hidden"
                  name="confirmations"
                  value={JSON.stringify(
                    familyMembers
                      .filter((m) => familyConfirm[m.id])
                      .map((m) => ({
                        guestId: m.id,
                        civilAttending: selectedEvents.includes(
                          EventType.CIVIL
                        ),
                        partyAttending: selectedEvents.includes(
                          EventType.FIESTA
                        ),
                      }))
                  )}
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    className={`${buttonBaseStyles} flex-1`}
                    style={{
                      backgroundColor: "transparent",
                      borderWidth: "2px",
                      borderColor: "var(--hueso)",
                      color: "var(--hueso)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--hueso)";
                      e.currentTarget.style.color = "var(--bourdeaux)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--hueso)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Atrás
                  </button>
                  <SubmitButton
                    label="Confirmar asistencia"
                    className={`${buttonBaseStyles} flex-1`}
                  />
                </div>
                {submitState.error && (
                  <span className="mt-2 block text-center text-sm font-normal text-[#ff6b6b]">
                    {submitState.error}
                  </span>
                )}
              </form>
            </motion.div>
          )}

          {/* ESTADO ESPECIAL: Invitado que ya confirmó */}
          {step === RSVPStep.ALREADY_CONFIRMED &&
            existingConfirmation &&
            !showSuccessOverlay && (
              <motion.div
                key="already-confirmed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className={formContainerStyles}
                style={{
                  backgroundColor: "rgba(250, 240, 230, 0.1)",
                  borderColor: "rgba(250, 240, 230, 0.2)",
                }}
              >
                {(() => {
                  const groupGuests = currentGuest?.group?.guests ?? [];
                  const isGroup = groupGuests.length > 1;

                  const getStatusLabel = (
                    confirmation: {
                      civilAttending: boolean;
                      partyAttending: boolean;
                    } | null
                  ): string => {
                    if (!confirmation) return "Sin confirmar";
                    if (
                      confirmation.civilAttending &&
                      confirmation.partyAttending
                    )
                      return "Civil + Fiesta";
                    if (confirmation.civilAttending) return "Solo Civil";
                    if (confirmation.partyAttending) return "Solo Fiesta";
                    return "No asiste";
                  };

                  return (
                    <>
                      <h3
                        className={formHeadingStyles}
                        style={{ color: "var(--hueso)" }}
                      >
                        {isGroup
                          ? "Ya se confirmó la asistencia del grupo"
                          : "Ya confirmaste tu asistencia"}
                      </h3>

                      <div
                        className="mb-6 rounded-xl border px-5 py-4"
                        style={{
                          background: "rgba(250, 240, 230, 0.08)",
                          borderColor: "rgba(250, 240, 230, 0.2)",
                        }}
                      >
                        {isGroup ? (
                          <>
                            <p
                              className="mb-1 text-base"
                              style={{ color: "var(--hueso)" }}
                            >
                              Gestionado por:{" "}
                              <strong>
                                {existingConfirmation.confirmedBy.firstName}{" "}
                                {existingConfirmation.confirmedBy.lastName}
                              </strong>
                            </p>
                            <p
                              className="mb-4 text-sm opacity-70"
                              style={{ color: "var(--text-light)" }}
                            >
                              el{" "}
                              {new Date(
                                existingConfirmation.confirmedAt
                              ).toLocaleDateString("es-AR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                            <ul className="flex flex-col gap-2">
                              {groupGuests.map((g) => (
                                <li
                                  key={g.id}
                                  className="flex items-center justify-between text-base"
                                >
                                  <span style={{ color: "var(--hueso)" }}>
                                    {g.firstName} {g.lastName}
                                  </span>
                                  <span
                                    className="text-sm opacity-70"
                                    style={{ color: "var(--text-light)" }}
                                  >
                                    {getStatusLabel(g.confirmation)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <>
                            <p
                              className="mb-4 text-sm opacity-70"
                              style={{ color: "var(--text-light)" }}
                            >
                              el{" "}
                              {new Date(
                                existingConfirmation.confirmedAt
                              ).toLocaleDateString("es-AR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                            <p
                              className="mb-2 text-sm tracking-widest uppercase opacity-70"
                              style={{ color: "var(--text-light)" }}
                            >
                              Eventos:
                            </p>
                            <ul className="flex flex-col gap-1">
                              {!existingConfirmation.civilAttending &&
                              !existingConfirmation.partyAttending ? (
                                <li
                                  className="text-base"
                                  style={{ color: "var(--hueso)" }}
                                >
                                  • No pudimos asistir
                                </li>
                              ) : (
                                <>
                                  {existingConfirmation.civilAttending && (
                                    <li
                                      className="text-base"
                                      style={{ color: "var(--hueso)" }}
                                    >
                                      • Ceremonia Civil
                                    </li>
                                  )}
                                  {existingConfirmation.partyAttending && (
                                    <li
                                      className="text-base"
                                      style={{ color: "var(--hueso)" }}
                                    >
                                      • Fiesta
                                    </li>
                                  )}
                                </>
                              )}
                            </ul>
                          </>
                        )}
                      </div>
                    </>
                  );
                })()}

                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className={`${buttonBaseStyles} flex-1`}
                    style={{
                      backgroundColor: "transparent",
                      borderWidth: "2px",
                      borderColor: "var(--hueso)",
                      color: "var(--hueso)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--hueso)";
                      e.currentTarget.style.color = "var(--bourdeaux)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--hueso)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Está bien, gracias
                  </button>
                  <button
                    onClick={startEditFlow}
                    className={`${buttonBaseStyles} flex-1`}
                    style={{
                      backgroundColor: "var(--hueso)",
                      color: "var(--bourdeaux-dark)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--hueso-dark)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(250, 240, 230, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--hueso)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Modificar confirmación
                  </button>
                </div>
              </motion.div>
            )}

          {/* Éxito — card inline, mismo estilo que los demás pasos */}
          {showSuccessOverlay && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={`${formContainerStyles} text-center`}
              style={{
                backgroundColor: "rgba(250, 240, 230, 0.1)",
                borderColor: "rgba(250, 240, 230, 0.2)",
              }}
            >
              <div
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-5xl font-bold"
                style={{
                  background: "var(--hueso)",
                  color: "var(--bourdeaux)",
                  animation: "scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                ✓
              </div>
              {successIsNoAttend ? (
                <>
                  <h3
                    className="font-display mb-3 text-3xl"
                    style={{ color: "var(--hueso)" }}
                  >
                    {RSVP_CONFIG.messages.success.noAttendance.title}
                  </h3>
                  <p className="mb-6" style={{ color: "var(--text-light)" }}>
                    {RSVP_CONFIG.messages.success.noAttendance.subtitle}
                  </p>
                </>
              ) : (
                <>
                  <h3
                    className="font-display mb-3 text-3xl"
                    style={{ color: "var(--hueso)" }}
                  >
                    {RSVP_CONFIG.messages.success.attendance.title}
                  </h3>
                  <p className="mb-6" style={{ color: "var(--text-light)" }}>
                    {RSVP_CONFIG.messages.success.attendance.subtitle}
                  </p>
                </>
              )}
              <button
                onClick={handleReset}
                className={`${buttonBaseStyles} w-full`}
                style={{
                  backgroundColor: "transparent",
                  borderWidth: "2px",
                  borderColor: "var(--hueso)",
                  color: "var(--hueso)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--hueso)";
                  e.currentTarget.style.color = "var(--bourdeaux)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--hueso)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Volver a la invitación
              </button>
            </motion.div>
          )}

          {/* Error message */}
          {formState === FormState.ERROR && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-4 rounded-lg border px-4 py-4 text-center text-sm"
              style={{
                background: "rgba(139, 68, 68, 0.4)",
                borderColor: "rgba(255, 107, 107, 0.5)",
                color: "var(--hueso)",
              }}
            >
              {RSVP_CONFIG.messages.errors.error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default RSVP;
