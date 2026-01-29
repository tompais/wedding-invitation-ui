import "./RSVP.css";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useState } from "react";

function RSVP() {
  const [ref, isVisible] = useScrollAnimation(0.2);
  const [formState, setFormState] = useState("idle"); // idle, submitting, success, error
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    attendance: "",
    events: [],
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.attendance) {
      newErrors.attendance = "Por favor confirmá tu asistencia";
    }

    if (formData.attendance === "yes" && formData.events.length === 0) {
      newErrors.events = "Seleccioná al menos un evento";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormState("submitting");

    try {
      const formBody = new URLSearchParams();
      formBody.append("nombre", formData.name);
      formBody.append("email", formData.email);
      formBody.append("_replyto", formData.email);
      formBody.append(
        "asistencia",
        formData.attendance === "yes"
          ? "Confirma asistencia"
          : "No puede asistir",
      );
      formBody.append("eventos", formData.events.join(", "));

      await fetch("https://formspree.io/f/mnjvnyze", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      });

      // Con no-cors siempre devuelve 'opaque', así que asumimos éxito
      setFormState("success");
      setFormData({ name: "", email: "", attendance: "", events: [] });
    } catch (error) {
      console.error("Error al enviar:", error);
      setFormState("error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      events: checked
        ? [...prev.events, value]
        : prev.events.filter((event) => event !== value),
    }));
    if (errors.events) {
      setErrors((prev) => ({ ...prev, events: "" }));
    }
  };

  return (
    <section className="rsvp" ref={ref}>
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
          Esta invitación es personal. Por favor, confirmá tu asistencia para
          poder organizar todo mejor.
        </motion.p>

        <AnimatePresence mode="wait">
          {formState === "success" ? (
            <motion.div
              className="rsvp-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <div className="success-icon">✓</div>
              <h3>¡Confirmación recibida!</h3>
              <p>Gracias por confirmar. ¡Te esperamos!</p>
              <button
                onClick={() => setFormState("idle")}
                className="btn-secondary"
              >
                Enviar otra confirmación
              </button>
            </motion.div>
          ) : (
            <motion.form
              className="rsvp-form"
              initial={{ opacity: 0, y: 40 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4 }}
              onSubmit={handleSubmit}
            >
              <label>
                <span>Nombre y apellido *</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={formState === "submitting"}
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </label>

              <label>
                <span>Email *</span>
                <input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={formState === "submitting"}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </label>

              <div className="rsvp-options">
                <p>¿Vas a poder acompañarnos? *</p>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="attendance"
                    value="yes"
                    checked={formData.attendance === "yes"}
                    onChange={handleInputChange}
                    disabled={formState === "submitting"}
                  />
                  Sí, confirmo
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="attendance"
                    value="no"
                    checked={formData.attendance === "no"}
                    onChange={handleInputChange}
                    disabled={formState === "submitting"}
                  />
                  No voy a poder asistir
                </label>
                {errors.attendance && (
                  <span className="error-message">{errors.attendance}</span>
                )}
              </div>

              {formData.attendance === "yes" && (
                <motion.div
                  className="rsvp-options"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p>¿A qué eventos vas a venir? *</p>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="Civil"
                      checked={formData.events.includes("Civil")}
                      onChange={handleCheckboxChange}
                      disabled={formState === "submitting"}
                    />
                    Civil
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="Fiesta"
                      checked={formData.events.includes("Fiesta")}
                      onChange={handleCheckboxChange}
                      disabled={formState === "submitting"}
                    />
                    Fiesta
                  </label>
                  {errors.events && (
                    <span className="error-message">{errors.events}</span>
                  )}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={formState === "submitting"}
                className={formState === "submitting" ? "btn-loading" : ""}
              >
                {formState === "submitting" ? (
                  <>
                    <span className="spinner"></span>
                    Enviando...
                  </>
                ) : (
                  "Enviar confirmación"
                )}
              </button>

              {formState === "error" && (
                <motion.p
                  className="error-banner"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Hubo un error. Por favor intentá de nuevo.
                </motion.p>
              )}
            </motion.form>
          )}
        </AnimatePresence>
        <div className="rsvp-calendar">
          <p>¿Querés agendar las fechas?</p>

          <button type="button">Agendar civil</button>
          <button type="button">Agendar fiesta</button>
        </div>
      </div>
    </section>
  );
}

export default RSVP;
