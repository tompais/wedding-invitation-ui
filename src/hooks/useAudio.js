import { useState, useRef } from "react";

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
 * @param {string} src - URL del archivo de audio
 * @param {Object} options - Configuración (loop, autoPlay)
 * @returns {Object} { audioRef, isMuted, toggleMute, play, pause }
 */
export function useAudio(src, options = {}) {
  const { loop = true, autoPlay = false, initialMuted = true } = options;

  // Referencia al elemento <audio> del DOM
  const audioRef = useRef(null);

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
