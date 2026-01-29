import "./EventInfo.css";
import Lottie from "lottie-react";
import rings from "../../assets/animatios/rings.json";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { MdNature } from "react-icons/md";

function EventInfo() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  return (
    <section className="event" ref={ref}>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        Las fechas
      </motion.h2>

      <motion.div
        className="event-blocks-container"
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <motion.div
          className="event-block"
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h3>Civil</h3>
          <div className="decorative-animation">
            <Lottie animationData={rings} loop />
          </div>
          <p>Jueves · Julio 2026</p>
          <p>Registro Civil</p>

          <div className="event-buttons">
            <button>Ver ubicación</button>
          </div>
        </motion.div>

        <motion.div
          className="event-block"
          initial={{ opacity: 0, y: 40 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <h3>Fiesta</h3>
          <p>Sábado · Julio 2026</p>
          <p>Quinta · Almuerzo</p>

          <p className="event-note">
            <MdNature
              size={20}
              style={{
                display: "inline-block",
                marginRight: "0.5rem",
                verticalAlign: "middle",
              }}
            />{" "}
            Evento al aire libre
          </p>

          <div className="event-buttons">
            <button>Ver ubicación</button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default EventInfo;
