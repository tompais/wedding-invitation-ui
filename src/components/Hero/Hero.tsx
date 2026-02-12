"use client";

import { motion } from "framer-motion";
import Divider from "../Divider/Divider";

export default function Hero() {
  return (
    <section className="bg-gradient-bourdeaux flex min-h-screen w-full items-center justify-center text-center text-text-light">
      <div className="mx-auto max-w-[900px] px-8">
        <motion.p
          className="mb-6 font-body text-lg uppercase tracking-[0.08em] opacity-80 text-text-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.2 }}
        >
          No hay distancia, ni frío, ni montaña que nos separe.
        </motion.p>

        <motion.h1
          className="mb-4 font-display text-6xl font-semibold tracking-[0.05em] text-hueso md:text-5xl sm:text-4xl"
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
          className="text-lg opacity-75 text-text-muted"
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
