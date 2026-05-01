"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import "yet-another-react-lightbox/styles.css";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Importar imágenes estáticamente (Next.js way)
import img1 from "../../assets/images/20240213_162814.jpg";
import img2 from "../../assets/images/20240412_231401.jpg";
import img3 from "../../assets/images/20240620_100500~2.jpg";
import img4 from "../../assets/images/20250614_225357.jpg";
import img5 from "../../assets/images/20251020_064816.jpg";
import img6 from "../../assets/images/WhatsApp Image 2026-01-26 at 07.16.09.jpeg";

// Array de imágenes
// objectPosition controla qué parte de la foto se muestra cuando se recorta.
// Valores útiles: "center top", "center center", "center bottom",
//                 "left top", "right top", "50% 30%"
const IMAGES = [
  { src: img1, alt: "Angie y Tomi - Foto 1", objectPosition: "center center" },
  { src: img2, alt: "Angie y Tomi - Foto 2", objectPosition: "center 20%" },
  { src: img3, alt: "Angie y Tomi - Foto 3", objectPosition: "50%" },
  { src: img4, alt: "Angie y Tomi - Foto 4", objectPosition: "center 20%" },
  { src: img5, alt: "Angie y Tomi - Foto 5", objectPosition: "center 20%" },
  { src: img6, alt: "Angie y Tomi - Foto 6", objectPosition: "center top" },
];

function Gallery() {
  const [ref, isVisible] = useScrollAnimation(0.2);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const [isAtBeginning, setIsAtBeginning] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section
      className="py-12 px-8 w-full text-center"
      style={{
        backgroundColor: "var(--hueso-dark)",
        color: "var(--text-dark)",
      }}
      ref={ref}
    >
      <motion.h2
        className="mb-10 text-4xl font-semibold font-display tracking-[0.05em]"
        style={{ color: "var(--bourdeaux-dark)" }}
        initial={{ opacity: 0, y: 30 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        Un poco de nosotros
      </motion.h2>

      <motion.div
        className="relative px-4 pb-12 mx-auto max-w-350"
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <button
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          disabled={isAtBeginning}
          className={`border-bourdeaux-light/40 bg-hueso/90 text-bourdeaux focus-visible:ring-bourdeaux focus-visible:ring-offset-hueso absolute top-[42%] left-0 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            isAtBeginning
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-bourdeaux hover:text-hueso"
          }`}
          aria-label="Foto anterior"
        >
          <FiChevronLeft size={20} />
        </button>

        <Swiper
          modules={[Pagination, Autoplay, EffectCoverflow]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setIsAtBeginning(swiper.isBeginning);
            setIsAtEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setIsAtBeginning(swiper.isBeginning);
            setIsAtEnd(swiper.isEnd);
          }}
          spaceBetween={20}
          slidesPerView={1}
          centeredSlides={true}
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
          className="py-8 pb-16 gallery-swiper"
        >
          {IMAGES.map((image, index) => (
            <SwiperSlide
              key={image.alt}
              className="flex justify-center items-center transition-transform duration-300"
            >
              <button
                type="button"
                onClick={() => openLightbox(index)}
                className="block p-0 w-full bg-transparent border-none cursor-pointer"
                aria-label={`Ver ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  className="object-cover w-full rounded-2xl transition-all duration-300 h-75 border-[3px] hover:-translate-y-1.25 hover:shadow-[0_15px_35px_rgba(114,47,55,0.35)]"
                  style={{
                    borderColor: "var(--bourdeaux-light)",
                    boxShadow: "0 10px 24px rgba(114, 47, 55, 0.2)",
                    objectPosition: image.objectPosition,
                  }}
                />
              </button>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          disabled={isAtEnd}
          className={`border-bourdeaux-light/40 bg-hueso/90 text-bourdeaux focus-visible:ring-bourdeaux focus-visible:ring-offset-hueso absolute top-[42%] right-0 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            isAtEnd
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-bourdeaux hover:text-hueso"
          }`}
          aria-label="Foto siguiente"
        >
          <FiChevronRight size={20} />
        </button>
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
