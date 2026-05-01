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
          className="flex fixed inset-0 justify-center items-center bg-gradient-bourdeaux-reverse z-[9999]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <div className="text-center text-hueso">
            {/* Logo / Iniciales */}
            <motion.div
              className="mb-8 text-6xl font-bold font-display tracking-[0.1em]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              A & T
            </motion.div>

            {/* Spinner personalizado */}
            <div className="my-8 mx-auto rounded-full animate-spin border-hueso/20 border-t-hueso h-[50px] w-[50px] border-[3px]" />

            {/* Texto */}
            <motion.p
              className="mt-6 text-base opacity-90 tracking-[0.05em]"
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
