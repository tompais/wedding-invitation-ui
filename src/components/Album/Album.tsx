"use client";

import "./Album.css";
import { motion } from "framer-motion";
import { FiCamera } from "react-icons/fi";
import { MdFavorite } from "react-icons/md";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

function Album() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  return (
    <section
      className="py-16 px-8 w-full text-center"
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
          className="mb-3 text-3xl font-semibold font-display tracking-[0.02em]"
          style={{ color: "var(--bourdeaux-dark)" }}
        >
          Álbum de fotos
        </h2>
        <p
          className="mb-6 text-base leading-relaxed font-body"
          style={{ color: "var(--text-muted)" }}
        >
          Compartí tus fotos y videos de este día tan especial.
          <br />
          Todo queda guardado en un solo lugar{" "}
          <MdFavorite className="inline-block ml-1 align-middle" />
        </p>

        <a
          href="https://photos.app.goo.gl/8WiWmecSPqVoxTZ19"
          target="_blank"
          rel="noopener noreferrer"
          className="album-button"
        >
          <FiCamera size={18} />
          Subí tus fotos
        </a>
      </motion.div>
    </section>
  );
}

export default Album;
