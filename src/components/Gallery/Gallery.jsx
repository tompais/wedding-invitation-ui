import "./Gallery.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useState, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

function Gallery() {
  const [ref, isVisible] = useScrollAnimation(0.2);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [images, setImages] = useState([]);

  // Cargar imágenes automáticamente desde assets/images
  useEffect(() => {
    const loadImages = async () => {
      const imageModules = import.meta.glob("../../assets/images/*", {
        eager: true,
      });

      const loadedImages = Object.entries(imageModules)
        .map(([path, module]) => {
          const filename = path.split("/").pop();
          return {
            src: module.default || module,
            alt: `Angie y Tomi - ${filename}`,
          };
        })
        .sort((a, b) => a.alt.localeCompare(b.alt)); // Ordenar alfabéticamente

      setImages(loadedImages);
    };

    loadImages();
  }, []);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section className="gallery" ref={ref}>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        Un poco de nosotros
      </motion.h2>

      <motion.div
        className="gallery-container"
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="gallery-track">
          {images.map((image) => (
            <button
              key={image.src}
              onClick={() => openLightbox(images.indexOf(image))}
              style={{
                cursor: "pointer",
                border: "none",
                padding: 0,
                background: "none",
              }}
              aria-label={`Ver ${image.alt}`}
              className="gallery-button"
            >
              <img src={image.src} alt={image.alt} />
            </button>
          ))}
        </div>
      </motion.div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={images}
        styles={{
          container: { backgroundColor: "rgba(90, 31, 40, 0.95)" },
        }}
      />
    </section>
  );
}

export default Gallery;
