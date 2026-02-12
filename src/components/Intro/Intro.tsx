"use client";

import { motion } from "framer-motion";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

function Intro() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  return (
    <section
      className="w-full px-8 py-20 text-center"
      style={{
        backgroundColor: "var(--hueso-dark)",
        color: "var(--text-dark)",
      }}
      ref={ref}
    >
      <motion.div
        className="mx-auto max-w-[800px]"
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <h2
          className="font-display mb-6 text-4xl font-semibold tracking-[0.02em]"
          style={{ color: "var(--bourdeaux-dark)" }}
        >
          Nos casamos
        </h2>

        <p
          className="font-body text-lg leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          Elegimos hacer esto a nuestra manera. Un civil en la intimidad, una
          fiesta al aire libre rodeados de los que más queremos. Será un día
          lleno de amor, risas y momentos para recordar.
        </p>
      </motion.div>
    </section>
  );
}

export default Intro;
