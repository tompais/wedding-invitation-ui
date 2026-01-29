import DressCode from "../DressCode/DressCode";
import Tips from "../Tips/Tips";
import Gifts from "../Gifts/Gifts";
import "./InfoCards.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

function InfoCards() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  return (
    <section className="info-cards" ref={ref}>
      <motion.div
        className="info-card"
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <DressCode />
      </motion.div>

      <motion.div
        className="info-card"
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Tips />
      </motion.div>

      <motion.div
        className="info-card"
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
