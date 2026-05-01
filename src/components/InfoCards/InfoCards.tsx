"use client";

import DressCode from "../DressCode/DressCode";
import Gifts from "../Gifts/Gifts";
import Tips from "../Tips/Tips";
import "./InfoCards.css";
import { motion } from "framer-motion";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

function InfoCards() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  const cardClasses =
    "info-card flex min-h-[360px] w-80 max-w-[340px] flex-col items-center rounded-2xl border border-hueso/15 p-7 text-center shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] md:w-[320px]";

  return (
    <section
      className="flex flex-wrap gap-8 justify-center py-20 px-8 w-full md:gap-4"
      style={{ backgroundColor: "var(--bourdeaux-dark)" }}
      ref={ref}
    >
      <motion.div
        className={cardClasses}
        style={{
          backgroundColor: "var(--bourdeaux)",
          color: "var(--text-light)",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <DressCode />
      </motion.div>

      <motion.div
        className={cardClasses}
        style={{
          backgroundColor: "var(--bourdeaux)",
          color: "var(--text-light)",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Tips />
      </motion.div>

      <motion.div
        className={cardClasses}
        style={{
          backgroundColor: "var(--bourdeaux)",
          color: "var(--text-light)",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Gifts />
      </motion.div>
    </section>
  );
}

export default InfoCards;
