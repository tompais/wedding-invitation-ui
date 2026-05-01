"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => setIsVisible(false), 2200);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="bg-gradient-bourdeaux-reverse fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <div className="text-hueso text-center">
            {/* Logo / Iniciales */}
            <motion.div
              className="font-display mb-8 text-6xl font-bold tracking-[0.1em]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              A & T
            </motion.div>

            {/* Spinner personalizado */}
            <div className="border-hueso/20 border-t-hueso mx-auto my-8 h-[50px] w-[50px] animate-spin rounded-full border-[3px]" />

            {/* Texto */}
            <motion.p
              className="mt-6 text-base tracking-[0.05em] opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Preparando tu invitación especial...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoadingScreen;
