import "./Hero.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Divider from "../Divider/Divider";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <motion.p
          className="hero-phrase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
        >
          No hay distancia, ni frío, ni montaña que nos separe.
        </motion.p>

        <motion.h1
          className="hero-names"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
        >
          Angie & Tomi
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 3 }}
        >
          <Divider />
        </motion.div>

        <motion.p
          className="hero-date"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 3.3 }}
        >
          Julio 2026
        </motion.p>
      </div>
    </section>
  );
}

export default Hero;
