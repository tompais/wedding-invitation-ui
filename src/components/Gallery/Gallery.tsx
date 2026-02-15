"use client";

import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useState } from "react";
import Image from "next/image";
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

// Importar imágenes estáticamente (Next.js way)
import img1 from "../../assets/images/20240213_162814.jpg";
import img2 from "../../assets/images/20240412_231401.jpg";
import img3 from "../../assets/images/20240620_100500~2.jpg";
import img4 from "../../assets/images/20250614_225357.jpg";
import img5 from "../../assets/images/20251020_064816.jpg";
import img6 from "../../assets/images/WhatsApp Image 2026-01-26 at 07.16.09.jpeg";

// Array de imágenes
const IMAGES = [
  { src: img1, alt: "Angie y Tomi - Foto 1" },
  { src: img2, alt: "Angie y Tomi - Foto 2" },
  { src: img3, alt: "Angie y Tomi - Foto 3" },
  { src: img4, alt: "Angie y Tomi - Foto 4" },
  { src: img5, alt: "Angie y Tomi - Foto 5" },
  { src: img6, alt: "Angie y Tomi - Foto 6" },
];

function Gallery() {
  const [ref, isVisible] = useScrollAnimation(0.2);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section
      className="w-full px-8 py-12 text-center"
      style={{
        backgroundColor: "var(--hueso-dark)",
        color: "var(--text-dark)",
      }}
      ref={ref}
    >
      <motion.h2
        className="font-display mb-10 text-4xl font-semibold tracking-[0.05em]"
        style={{ color: "var(--bourdeaux-dark)" }}
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        Un poco de nosotros
      </motion.h2>

      <motion.div
        className="mx-auto max-w-350 px-4 pb-12"
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
          className="gallery-swiper py-8 pb-16"
        >
          {IMAGES.map((image, index) => (
            <SwiperSlide
              key={image.alt}
              className="flex items-center justify-center transition-transform duration-300"
            >
              <button
                onClick={() => openLightbox(index)}
                className="block w-full cursor-pointer border-none bg-transparent p-0"
                aria-label={`Ver ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  className="h-75 w-full rounded-2xl border-[3px] object-cover transition-all duration-300 hover:-translate-y-1.25 hover:shadow-[0_15px_35px_rgba(114,47,55,0.35)]"
                  style={{
                    borderColor: "var(--bourdeaux-light)",
                    boxShadow: "0 10px 24px rgba(114, 47, 55, 0.2)",
                  }}
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={IMAGES.map((img) => ({ src: img.src.src, alt: img.alt }))}
        styles={{
          container: { backgroundColor: "rgba(90, 31, 40, 0.95)" },
        }}
      />
    </section>
  );
}

export default Gallery;
