import { useEffect, useRef, useState, RefObject } from "react";

/**
 * Hook personalizado para detectar cuando un elemento entra al viewport
 * y activar animaciones
 *
 * @param threshold - Porcentaje del elemento que debe estar visible (0-1)
 * @returns Tupla con [ref, isVisible]
 */
export const useScrollAnimation = (
  threshold: number = 0.1
): [RefObject<HTMLElement | null>, boolean] => {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Una vez visible, dejar de observar para mejor performance
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px", // Activa un poco antes de entrar completamente
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return [ref, isVisible];
};
