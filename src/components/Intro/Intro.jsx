import "./Intro.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

function Intro() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  return (
    <section className="intro" ref={ref}>
      <motion.div
        className="intro-content"
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <h2>Nos casamos</h2>

        <p>
          Elegimos hacer esto a nuestra manera. Un civil en la intimidad, una
          fiesta al aire libre rodeados de los que más queremos. Será un día
          lleno de amor, risas y momentos para recordar.
        </p>
      </motion.div>
    </section>
  );
}

export default Intro;
