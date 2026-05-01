import { type RefObject, useRef, useState } from "react";

/**
 * HOOK PERSONALIZADO: useAudio
 *
 * Responsabilidad (SOLID):
 * - Gestionar reproducción de audio
 * - Controlar estado de mute/unmute
 * - Manejar autoplay y loop
 *
 * Beneficios:
 * - Separa lógica de audio del componente visual
 * - Reutilizable para cualquier reproductor
 * - Testeable de forma independiente
 *
 * @param src - URL del archivo de audio
 * @param options - Configuración (loop, autoPlay, initialMuted)
 * @returns Objeto con ref, estado y funciones de control
 */

interface UseAudioOptions {
  loop?: boolean;
  autoPlay?: boolean;
  initialMuted?: boolean;
}

interface UseAudioReturn {
  audioRef: RefObject<HTMLAudioElement | null>;
  isMuted: boolean;
  toggleMute: () => void;
  play: () => void;
  pause: () => void;
  audioProps: {
    ref: RefObject<HTMLAudioElement | null>;
    loop: boolean;
    autoPlay: boolean;
    muted: boolean;
    crossOrigin: "anonymous";
  };
}

export function useAudio(
  _src: string,
  options: UseAudioOptions = {}
): UseAudioReturn {
  const { loop = true, autoPlay = false, initialMuted = true } = options;

  // Referencia al elemento <audio> del DOM
  const audioRef = useRef<HTMLAudioElement>(null);

  // Estado: controla si está muteado
  const [isMuted, setIsMuted] = useState(initialMuted);

  /**
   * Reproduce el audio
   */
  const play = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  /**
   * Pausa el audio
   */
  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  /**
   * Alterna entre mute y unmute
   * - Si está muteado: lo activa y reproduce
   * - Si está activo: lo mutea y pausa
   */
  const toggleMute = () => {
    if (isMuted) {
      play();
      setIsMuted(false);
    } else {
      pause();
      setIsMuted(true);
    }
  };

  return {
    audioRef,
    isMuted,
    toggleMute,
    play,
    pause,
    // Props para el elemento <audio>
    audioProps: {
      ref: audioRef,
      loop,
      autoPlay,
      muted: isMuted,
      crossOrigin: "anonymous",
    },
  };
}
