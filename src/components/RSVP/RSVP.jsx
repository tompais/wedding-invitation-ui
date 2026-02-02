import "./RSVP.css";
// eslint-disable-next-line no-unused-vars -- motion se usa en JSX (motion.h2, motion.div, etc.)
import { motion, AnimatePresence } from "framer-motion";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useState } from "react";
import guestData from "../../data/guests.json";
import { RSVP_CONFIG } from "../../constants/rsvp";
import { sendRSVPConfirmation } from "../../utils/api";
import Loading from "../common/Loading/Loading";

function RSVP() {
  const [ref, isVisible] = useScrollAnimation(0.2);
  const [step, setStep] = useState(1); // 1: Código, 2: Confirmar, 3: ¿Vas a asistir?, 4: Eventos, 5: Familia
  const [formState, setFormState] = useState("idle");
  const [code, setCode] = useState("");
  const [isNoAttendance, setIsNoAttendance] = useState(false);
  const [currentGuest, setCurrentGuest] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [familyConfirm, setFamilyConfirm] = useState({});
  const [errors, setErrors] = useState("");

  // Extraer grupo familiar del código
  const getFamily = (guestCode) => {
    const familyCode = guestCode.substring(0, 12); // FLIA-SOMMA-xxx o AMIG-MAI-xxx

    return guestData.filter(
      (guest) => guest.codigo.substring(0, 12) === familyCode
    );
  };

  // Paso 1: Validar código
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setErrors("");

    const guest = guestData.find(
      (g) => g.codigo.toUpperCase() === code.toUpperCase()
    );

    if (!guest) {
      setErrors(RSVP_CONFIG.messages.errors.codeNotFound);
      return;
    }

    setCurrentGuest(guest);
    const family = getFamily(guest.codigo);
    setFamilyMembers(family);

    // Inicializar confirmación de familia
    const initialConfirm = {};
    family.forEach((member) => {
      initialConfirm[member.codigo] = member.codigo === guest.codigo;
    });
    setFamilyConfirm(initialConfirm);

    setStep(2);
  };

  // Paso 3: Decidir si asistir
  const handleAttendanceDecision = (attending) => {
    if (attending) {
      // Va a asistir - continuar a selección de eventos
      setStep(4);
    } else {
      // No va a asistir - enviar directamente
      handleNoAttendance();
    }
  };

  // Enviar confirmación de no asistencia
  const handleNoAttendance = async () => {
    setFormState("submitting");
    setIsNoAttendance(true);

    try {
      const confirmationData = {
        codigoPrincipal: currentGuest.codigo,
        nombrePrincipal: `${currentGuest.nombre} ${currentGuest.apellido}`,
        asistencia: "No va a poder asistir",
        eventos: "N/A",
        grupoFamiliar: "N/A",
        totalPersonas: 0,
      };

      const result = await sendRSVPConfirmation(confirmationData);

      if (result.success) {
        setFormState("success");
        setTimeout(() => {
          setStep(1);
          setCode("");
          setCurrentGuest(null);
          setSelectedEvents([]);
          setIsNoAttendance(false);
          setFormState("idle");
        }, RSVP_CONFIG.successMessageDuration);
      } else {
        setFormState("error");
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      setFormState("error");
    }
  };

  // Paso 4: Seleccionar eventos
  const handleEventToggle = (event) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  // Paso 4: Enviar confirmación
  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    if (selectedEvents.length === 0) {
      setErrors(RSVP_CONFIG.messages.errors.selectEvent);
      return;
    }

    const confirmedFamilyMembers = Object.entries(familyConfirm)
      .filter(([_, isConfirmed]) => isConfirmed)
      .map(([codigo]) => guestData.find((g) => g.codigo === codigo));

    setFormState("submitting");

    try {
      const confirmationData = {
        codigoPrincipal: currentGuest.codigo,
        nombrePrincipal: `${currentGuest.nombre} ${currentGuest.apellido}`,
        asistencia: "Confirma asistencia",
        eventos: selectedEvents.join(", "),
        grupoFamiliar: confirmedFamilyMembers
          .map((m) => `${m.nombre} ${m.apellido}`)
          .join(", "),
        totalPersonas: confirmedFamilyMembers.length,
      };

      const result = await sendRSVPConfirmation(confirmationData);

      if (result.success) {
        setFormState("success");
        setTimeout(() => {
          setStep(1);
          setCode("");
          setCurrentGuest(null);
          setSelectedEvents([]);
          setFormState("idle");
        }, RSVP_CONFIG.successMessageDuration);
      } else {
        setFormState("error");
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      setFormState("error");
    }
  };

  const handleBackStep = () => {
    if (step === 2) {
      setStep(1);
      setCode("");
      setCurrentGuest(null);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 4) {
      setStep(3);
    } else if (step === 5) {
      setStep(4);
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
              <form onSubmit={handleCodeSubmit}>
                <input
                  type="text"
                  placeholder={RSVP_CONFIG.placeholders.code}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={formState === "submitting"}
                />
                {errors && <span className="error-message">{errors}</span>}
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
                  {currentGuest.nombre} {currentGuest.apellido}
                </p>
              </div>
              <div className="step-buttons">
                <button onClick={handleBackStep} className="btn-secondary">
                  Atrás
                </button>
                <button onClick={() => setStep(3)} className="btn-primary">
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
                    onChange={() => handleEventToggle("Civil")}
                  />
                  <span>Ceremonia Civil</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes("Fiesta")}
                    onChange={() => handleEventToggle("Fiesta")}
                  />
                  <span>Fiesta</span>
                </label>
              </div>

              {errors && <span className="error-message">{errors}</span>}

              <div className="step-buttons">
                <button onClick={handleBackStep} className="btn-secondary">
                  Atrás
                </button>
                <button
                  onClick={() => setStep(5)}
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
                  <label key={member.codigo} className="family-checkbox">
                    <input
                      type="checkbox"
                      checked={familyConfirm[member.codigo] || false}
                      onChange={(e) =>
                        setFamilyConfirm((prev) => ({
                          ...prev,
                          [member.codigo]: e.target.checked,
                        }))
                      }
                    />
                    <span className="family-name">
                      {member.nombre} {member.apellido}
                    </span>
                  </label>
                ))}
              </div>

              <div className="step-buttons">
                <button onClick={handleBackStep} className="btn-secondary">
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
