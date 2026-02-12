"use client";

import "./RSVP.css";

import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useRSVPFlow } from "../../hooks/useRSVPFlow";
import { RSVP_CONFIG } from "../../constants/rsvp";
import { guestCodeSchema } from "../../schemas/rsvp.schema";
import Loading from "../common/Loading/Loading";

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
    isNoAttendance,
    currentGuest,
    familyMembers,
    familyConfirm,
    selectedEvents,
    processGuestCode,
    handleAttendanceDecision,
    toggleEvent,
    toggleFamilyMember,
    submitAttendance,
    goBack,
    goForward,
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

  /**
   * Handler para envío final
   */
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitAttendance();

    // Si hay error de validación, podríamos mostrarlo aquí
    if (!result?.success && result?.error) {
      // El error ya se maneja en el hook
    }
  };

  return (
    <section className="rsvp" ref={ref}>
      {/* Loading overlay durante el envío */}
      {formState === "submitting" && (
        <Loading
          size="large"
          message={RSVP_CONFIG.messages.errors.submitting}
          overlay={true}
        />
      )}

      <div className="rsvp-container">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Confirmación de asistencia
        </motion.h2>

        <motion.p
          className="rsvp-intro"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Completá tu confirmación siguiendo los pasos
        </motion.p>

        <AnimatePresence mode="wait">
          {/* PASO 1: Ingresar código */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="rsvp-form"
            >
              <div className="step-indicator">
                {RSVP_CONFIG.stepIndicators[1]}
              </div>
              <h3>Ingresá tu código de invitado</h3>
              <form onSubmit={handleSubmit(onCodeSubmit)}>
                <input
                  type="text"
                  placeholder={RSVP_CONFIG.placeholders.code}
                  {...register("code", {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                  disabled={formState === "submitting"}
                />
                {formErrors.code && (
                  <span className="error-message">
                    {formErrors.code.message}
                  </span>
                )}
                <button type="submit">Continuar</button>
              </form>
            </motion.div>
          )}

          {/* PASO 2: Confirmar identidad */}
          {step === 2 && currentGuest && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="rsvp-form"
            >
              <div className="step-indicator">
                {RSVP_CONFIG.stepIndicators[2]}
              </div>
              <h3>Confirmá tu identidad</h3>
              <div className="guest-card">
                <p className="guest-name">
                  {currentGuest.firstName} {currentGuest.lastName}
                </p>
              </div>
              <div className="step-buttons">
                <button onClick={goBack} className="btn-secondary">
                  Atrás
                </button>
                <button onClick={goForward} className="btn-primary">
                  Soy yo!
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 3: ¿Vas a asistir? */}
          {step === 3 && currentGuest && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="rsvp-form"
            >
              <div className="step-indicator">
                {RSVP_CONFIG.stepIndicators[3]}
              </div>
              <h3>¿Vas a poder acompañarnos?</h3>
              <div className="attendance-buttons">
                <button
                  onClick={() => handleAttendanceDecision(true)}
                  className="btn-primary large"
                >
                  Sí, me encanta!
                </button>
                <button
                  onClick={() => handleAttendanceDecision(false)}
                  className="btn-secondary large"
                >
                  No puedo asistir
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 4: Seleccionar eventos */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="rsvp-form"
            >
              <div className="step-indicator">
                {RSVP_CONFIG.stepIndicators[4]}
              </div>
              <h3>¿A cuál de los eventos asistís?</h3>

              <div className="events-selector">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes("Civil")}
                    onChange={() => toggleEvent("Civil")}
                  />
                  <span>Ceremonia Civil</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes("Fiesta")}
                    onChange={() => toggleEvent("Fiesta")}
                  />
                  <span>Fiesta</span>
                </label>
              </div>

              <div className="step-buttons">
                <button onClick={goBack} className="btn-secondary">
                  Atrás
                </button>
                <button
                  onClick={goForward}
                  className="btn-primary"
                  disabled={selectedEvents.length === 0}
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {/* PASO 5: Confirmar grupo familiar */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="rsvp-form"
            >
              <div className="step-indicator">
                {RSVP_CONFIG.stepIndicators[5]}
              </div>
              <h3>Confirmá quiénes asisten de tu grupo</h3>

              <div className="family-selector">
                {familyMembers.map((member) => (
                  <label key={member.code} className="family-checkbox">
                    <input
                      type="checkbox"
                      checked={familyConfirm[member.code] || false}
                      onChange={(e) =>
                        toggleFamilyMember(member.code, e.target.checked)
                      }
                    />
                    <span className="family-name">
                      {member.firstName} {member.lastName}
                    </span>
                  </label>
                ))}
              </div>

              <div className="step-buttons">
                <button onClick={goBack} className="btn-secondary">
                  Atrás
                </button>
                <button onClick={handleFinalSubmit} className="btn-primary">
                  Confirmar asistencia
                </button>
              </div>
            </motion.div>
          )}

          {/* Success message */}
          {formState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="success-message"
            >
              <div className="success-card">
                <div className="success-icon">✓</div>
                {isNoAttendance ? (
                  <>
                    <h3>{RSVP_CONFIG.messages.success.noAttendance.title}</h3>
                    <p>{RSVP_CONFIG.messages.success.noAttendance.subtitle}</p>
                  </>
                ) : (
                  <>
                    <h3>{RSVP_CONFIG.messages.success.attendance.title}</h3>
                    <p>{RSVP_CONFIG.messages.success.attendance.subtitle}</p>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Error message */}
          {formState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="error-banner"
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
