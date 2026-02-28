"use client";

import type { ActionState } from "@/types/ActionState";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useRSVPFlow } from "@/hooks/useRSVPFlow";
import type { MemberConfirmation } from "@/hooks/useRSVPFlow";
import { RSVP_CONFIG } from "@/constants/rsvp";
import { guestCodeSchema } from "@/schemas/rsvp.schema";
import Loading from "../common/Loading/Loading";
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
 * La lógica de negocio está delegada a useRSVPFlow.
 * Flujo unificado: CODE_INPUT → ATTENDANCE_DECISION → CONFIRMATION_GRID → SUCCESS
 */

// ─── Sub-componente: toggle SÍ/NO ──────────────────────────────────────────

interface EventToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

function EventToggle({
  value,
  onChange,
  disabled,
  ariaLabel,
}: EventToggleProps) {
  return (
    <div
      className="flex overflow-hidden rounded-lg border"
      style={{ borderColor: "rgba(250, 240, 230, 0.3)" }}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => onChange(true)}
        disabled={disabled}
        aria-pressed={value}
        className="min-h-[44px] min-w-[36px] px-3 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--hueso)] focus-visible:outline-none"
        style={{
          backgroundColor: value ? "var(--hueso)" : "transparent",
          color: value ? "var(--bourdeaux)" : "var(--hueso)",
          opacity: disabled ? 0.35 : value ? 1 : 0.6,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        SÍ
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        disabled={disabled}
        aria-pressed={!value}
        className="min-h-[44px] min-w-[36px] border-l px-3 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--hueso)] focus-visible:outline-none"
        style={{
          borderColor: "rgba(250, 240, 230, 0.3)",
          backgroundColor: !value ? "var(--hueso)" : "transparent",
          color: !value ? "var(--bourdeaux)" : "var(--hueso)",
          opacity: disabled ? 0.35 : !value ? 1 : 0.6,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        NO
      </button>
    </div>
  );
}

// ─── Tipos derivados ────────────────────────────────────────────────────────

type GridMember = {
  id: string;
  firstName: string;
  lastName: string;
};

// ─── Componente principal ───────────────────────────────────────────────────

function RSVP() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  const {
    step,
    currentGuest,
    memberConfirmations,
    processGuestCode,
    attend,
    toggleMemberChecked,
    setMemberEvent,
    goBack,
    reset,
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

  const [isLookingUpCode, setIsLookingUpCode] = useState(false);

  const onCodeSubmit = async (data: { code: string }) => {
    setIsLookingUpCode(true);
    const result = await processGuestCode(data.code);
    setIsLookingUpCode(false);

    if (!result.success) {
      setError("code", { type: "manual", message: result.error });
    }
  };

  // useActionState para el submit final (un único action para ambos casos)
  const [submitState, formAction, submitPending] = useActionState(
    async (prevState: ActionState, formData: FormData) =>
      await confirmAttendanceAction(prevState, formData),
    { success: false, error: null }
  );

  // Detecta la transición pending → completado durante el render.
  // Ver: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [prevPending, setPrevPending] = useState(false);
  if (prevPending !== submitPending) {
    setPrevPending(submitPending);
    if (prevPending && !submitPending && submitState.success) {
      setShowSuccessOverlay(true);
    }
  }

  // Estado derivado: ¿todos los checked marcaron NO a ambos eventos?
  const checkedMembers = Object.values(memberConfirmations).filter(
    (m) => m.checked
  );
  const isNoAttendance =
    checkedMembers.length > 0 &&
    checkedMembers.every((m: MemberConfirmation) => !m.civil && !m.fiesta);

  const handleReset = () => {
    setShowSuccessOverlay(false);
    reset();
  };

  // ─── Miembros ordenados para la grilla (invitado actual primero) ──────────

  const allMembers: GridMember[] = currentGuest
    ? currentGuest.group
      ? [
          ...currentGuest.group.guests
            .filter((g) => g.id === currentGuest.id)
            .map((g) => ({
              id: g.id,
              firstName: g.firstName,
              lastName: g.lastName,
            })),
          ...currentGuest.group.guests
            .filter((g) => g.id !== currentGuest.id)
            .map((g) => ({
              id: g.id,
              firstName: g.firstName,
              lastName: g.lastName,
            })),
        ]
      : [
          {
            id: currentGuest.id,
            firstName: currentGuest.firstName,
            lastName: currentGuest.lastName,
          },
        ]
    : [];

  // Payload de confirmaciones para el form hidden input
  const confirmationsPayload = JSON.stringify(
    Object.entries(memberConfirmations)
      .filter(([, conf]) => conf.checked)
      .map(([guestId, conf]) => ({
        guestId,
        civilAttending: conf.civil,
        partyAttending: conf.fiesta,
      }))
  );

  // ─── Shared styles ────────────────────────────────────────────────────────

  const formContainerStyles =
    "max-w-full rounded-2xl border px-8 py-8 shadow-[0_10px_30px_rgba(0,0,0,0.25)] md:px-6";
  const formHeadingStyles =
    "mb-6 text-center font-display text-2xl md:mb-4 md:text-xl";
  const inputStyles =
    "w-full rounded-lg border-2 px-4 py-3.5 font-body text-base outline-none transition-all duration-300";
  const buttonBaseStyles =
    "flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-lg border-none px-3 py-3 text-base font-semibold transition-all duration-300";

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
      {submitPending && (
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
              className={`${formContainerStyles} text-left`}
              style={{
                backgroundColor: "rgba(250, 240, 230, 0.1)",
                borderColor: "rgba(250, 240, 230, 0.2)",
              }}
            >
              <div className="mb-4 text-sm tracking-widest uppercase">
                {RSVP_CONFIG.stepIndicators[RSVPStep.CODE_INPUT]}
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
                  disabled={isLookingUpCode}
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
                    opacity: isLookingUpCode ? "0.7" : "1",
                    cursor: isLookingUpCode ? "not-allowed" : "pointer",
                  }}
                  disabled={isLookingUpCode}
                  onMouseEnter={(e) => {
                    if (!isLookingUpCode) {
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
                  {isLookingUpCode ? "Buscando..." : "Continuar"}
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
                  {RSVP_CONFIG.stepIndicators[RSVPStep.ATTENDANCE_DECISION]}
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
                    onClick={attend}
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

          {/* PASO 3: Grilla de confirmación persona × evento */}
          {step === RSVPStep.CONFIRMATION_GRID &&
            currentGuest &&
            !showSuccessOverlay && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className={`${formContainerStyles} text-left`}
                style={{
                  backgroundColor: "rgba(250, 240, 230, 0.1)",
                  borderColor: "rgba(250, 240, 230, 0.2)",
                }}
              >
                <div className="mb-4 text-sm tracking-widest uppercase">
                  {RSVP_CONFIG.stepIndicators[RSVPStep.CONFIRMATION_GRID]}
                </div>
                <h3
                  className={formHeadingStyles}
                  style={{ color: "var(--hueso)" }}
                >
                  Confirmá la asistencia del grupo
                </h3>

                {/* Encabezados de eventos */}
                <div className="mb-2 grid grid-cols-[1fr_auto_auto] items-center gap-3 px-1">
                  <div />
                  <div
                    className="w-[72px] text-center text-xs tracking-widest uppercase opacity-60"
                    style={{ color: "var(--text-light)" }}
                  >
                    Civil
                  </div>
                  <div
                    className="w-[72px] text-center text-xs tracking-widest uppercase opacity-60"
                    style={{ color: "var(--text-light)" }}
                  >
                    Fiesta
                  </div>
                </div>

                {/* Filas de miembros */}
                <div className="mb-6 flex flex-col gap-2">
                  {allMembers.map((member) => {
                    const conf = memberConfirmations[member.id];
                    const isCurrentGuest = member.id === currentGuest.id;
                    const isActive = conf?.checked ?? false;

                    return (
                      <div
                        key={member.id}
                        className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200"
                        style={{
                          backgroundColor: "rgba(250, 240, 230, 0.08)",
                          borderColor:
                            isCurrentGuest || isActive
                              ? "rgba(250, 240, 230, 0.25)"
                              : "rgba(250, 240, 230, 0.1)",
                          opacity: !isCurrentGuest && !isActive ? 0.5 : 1,
                        }}
                      >
                        {/* Nombre + checkbox opcional */}
                        <div className="flex min-w-0 items-center gap-2">
                          {!isCurrentGuest && (
                            <input
                              type="checkbox"
                              id={`member-${member.id}`}
                              checked={conf?.checked ?? false}
                              onChange={() => toggleMemberChecked(member.id)}
                              className="h-4 w-4 flex-shrink-0 cursor-pointer accent-(--hueso)"
                              aria-label={`Incluir a ${member.firstName} ${member.lastName}`}
                            />
                          )}
                          <label
                            htmlFor={
                              isCurrentGuest ? undefined : `member-${member.id}`
                            }
                            className={`min-w-0 truncate text-sm ${isCurrentGuest ? "cursor-default font-semibold" : "cursor-pointer"}`}
                            style={{ color: "var(--hueso)" }}
                          >
                            {member.firstName} {member.lastName}
                            {isCurrentGuest && (
                              <span className="ml-1.5 text-xs font-normal opacity-60">
                                (vos)
                              </span>
                            )}
                          </label>
                        </div>

                        {/* Toggle Civil */}
                        <EventToggle
                          value={conf?.civil ?? true}
                          onChange={(v) =>
                            setMemberEvent(member.id, "civil", v)
                          }
                          disabled={!isCurrentGuest && !isActive}
                          ariaLabel={`Civil — ${member.firstName}`}
                        />

                        {/* Toggle Fiesta */}
                        <EventToggle
                          value={conf?.fiesta ?? true}
                          onChange={(v) =>
                            setMemberEvent(member.id, "fiesta", v)
                          }
                          disabled={!isCurrentGuest && !isActive}
                          ariaLabel={`Fiesta — ${member.firstName}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Form de confirmación */}
                <form action={formAction} className="flex flex-col gap-3">
                  <input
                    type="hidden"
                    name="confirmedById"
                    value={currentGuest.id}
                  />
                  <input
                    type="hidden"
                    name="confirmations"
                    value={confirmationsPayload}
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

          {/* Éxito */}
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
              {isNoAttendance ? (
                <>
                  <h3
                    className="font-display mb-3 text-center text-3xl"
                    style={{ color: "var(--hueso)" }}
                  >
                    {RSVP_CONFIG.messages.success.noAttendance.title}
                  </h3>
                  <p
                    className="mb-6 text-center"
                    style={{ color: "var(--text-light)" }}
                  >
                    {RSVP_CONFIG.messages.success.noAttendance.subtitle}
                  </p>
                </>
              ) : (
                <>
                  <h3
                    className="font-display mb-3 text-center text-3xl"
                    style={{ color: "var(--hueso)" }}
                  >
                    {RSVP_CONFIG.messages.success.attendance.title}
                  </h3>
                  <p
                    className="mb-6 text-center"
                    style={{ color: "var(--text-light)" }}
                  >
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
        </AnimatePresence>
      </div>
    </section>
  );
}

export default RSVP;
