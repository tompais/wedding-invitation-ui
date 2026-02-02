import "./Gallery.css";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useState, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  EffectCoverflow,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

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
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
          spaceBetween={20}
          slidesPerView={1}
          centeredSlides={true}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          effect="coverflow"
          coverflowEffect={{
            rotate: 20,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          breakpoints={{
            640: {
              slidesPerView: 1.5,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 25,
            },
            1024: {
              slidesPerView: 2.5,
              spaceBetween: 30,
            },
          }}
          className="gallery-swiper"
        >
          {images.map((image, index) => (
            <SwiperSlide key={image.src}>
              <button
                onClick={() => openLightbox(index)}
                className="gallery-button"
                aria-label={`Ver ${image.alt}`}
              >
                <img src={image.src} alt={image.alt} />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
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
