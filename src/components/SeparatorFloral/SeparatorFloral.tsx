"use client";

import { motion } from "framer-motion";

export default function SeparatorFloral() {
  return (
    <motion.div
      className="my-4 flex w-full items-center justify-center py-8 md:my-2 md:py-6"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <svg
        viewBox="0 0 200 80"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full max-w-[400px] md:max-w-[250px]"
        style={{ filter: "drop-shadow(0 2px 4px rgba(90, 31, 40, 0.1))" }}
      >
        {/* Centro decorativo */}
        <circle cx="100" cy="40" r="8" fill="var(--bourdeaux)" />

        {/* Flores izquierda */}
        <g>
          <circle
            cx="50"
            cy="30"
            r="3"
            fill="var(--bourdeaux-light)"
            opacity="0.7"
          />
          <circle
            cx="45"
            cy="50"
            r="2.5"
            fill="var(--bourdeaux-light)"
            opacity="0.5"
          />
          <path
            d="M 30 40 Q 60 35 80 40"
            stroke="var(--bourdeaux-light)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
        </g>

        {/* Flores derecha */}
        <g>
          <circle
            cx="150"
            cy="30"
            r="3"
            fill="var(--bourdeaux-light)"
            opacity="0.7"
          />
          <circle
            cx="155"
            cy="50"
            r="2.5"
            fill="var(--bourdeaux-light)"
            opacity="0.5"
          />
          <path
            d="M 170 40 Q 140 35 120 40"
            stroke="var(--bourdeaux-light)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.6"
          />
        </g>

        {/* Línea central */}
        <line
          x1="10"
          y1="40"
          x2="190"
          y2="40"
          stroke="var(--bourdeaux-light)"
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
    </motion.div>
  );
}
