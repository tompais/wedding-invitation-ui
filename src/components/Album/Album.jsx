import "./Album.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { MdFavorite } from "react-icons/md";
import { FiCamera } from "react-icons/fi";

function Album() {
  const [ref, isVisible] = useScrollAnimation(0.2);

  return (
    <section className="album" ref={ref}>
      <motion.div
        className="album-content"
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <h2>Álbum de fotos</h2>
        <p>
          Compartí tus fotos y videos de este día tan especial.
          <br />
          Todo queda guardado en un solo lugar{" "}
          <MdFavorite
            style={{
              display: "inline-block",
              marginLeft: "0.3rem",
              verticalAlign: "middle",
            }}
          />
        </p>

        <a
          href="https://photos.app.goo.gl/8WiWmecSPqVoxTZ19"
          target="_blank"
          rel="noopener noreferrer"
          className="album-button"
        >
          <FiCamera
            size={18}
            style={{ marginRight: "0.5rem", verticalAlign: "middle" }}
          />
          Subí tus fotos
        </a>
      </motion.div>
    </section>
  );
}

export default Album;
