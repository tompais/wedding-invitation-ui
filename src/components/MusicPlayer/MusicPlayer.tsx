"use client";

import { useState, useEffect } from "react";
import { FiVolume2 } from "react-icons/fi";
import { useAudio } from "../../hooks/useAudio";

/**
 * COMPONENTE: MusicPlayer
 *
 * Responsabilidad (SOLID - Single Responsibility):
 * - Renderizar el botón flotante de música
 * - Mostrar tooltip inicial para invitar al usuario a activar música
 *
 * Principios aplicados:
 * - SOLID: Lógica de audio separada en hook useAudio
 * - DRY: Reutiliza lógica de audio que puede usarse en otros componentes
 * - KISS: Componente simple que solo maneja UI, no lógica de audio
 *
 * Mejoras implementadas:
 * - Hook useAudio maneja toda la lógica de reproducción
 * - Estado de tooltip independiente de estado de audio
 * - Props de audio calculadas en el hook (separation of concerns)
 */
function MusicPlayer() {
  // Estado: controla si se muestra el tooltip de invitación
  const [showTooltip, setShowTooltip] = useState(false);

  // Hook personalizado: maneja toda la lógica de reproducción de audio
  const { audioRef, isMuted, toggleMute, audioProps } = useAudio(
    "/music/Diana_Ross_ft_Marvin_Gaye_-_Ain_t_no_mountain_high_enough_(mp3.pm).mp3",
    {
      loop: true,
      autoPlay: false,
      initialMuted: true,
    }
  );

  /**
   * Efecto: Muestra el tooltip después de 2 segundos
   * Invita al usuario a activar la música de forma sutil
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Maneja el click en el botón de música
   * Oculta el tooltip y delega la lógica al hook useAudio
   */
  const handleClick = () => {
    toggleMute();
    setShowTooltip(false);
  };

  return (
    <>
      {/* Elemento de audio controlado por el hook */}
      <audio {...audioProps}>
        <source
          src="/music/Diana_Ross_ft_Marvin_Gaye_-_Ain_t_no_mountain_high_enough_(mp3.pm).mp3"
          type="audio/mpeg"
        />
      </audio>

      {/* Botón flotante de música */}
      <button
        className="music-button"
        onClick={handleClick}
        title={isMuted ? "Activar música" : "Mutear música"}
        aria-label={isMuted ? "Activar música" : "Mutear música"}
      >
        {/* Tooltip que se muestra solo al inicio y si está muteado */}
        {showTooltip && isMuted && (
          <span className="tooltip animate-[slideUp_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
            <style jsx>{`
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
            <span className="absolute right-5 top-full h-0 w-0 border-l-[8px] border-r-0 border-t-[8px] border-l-transparent border-r-transparent border-t-bourdeaux-dark" />
            🎵 Activa la música
          </span>
        )}

        {/* Icono de volumen (siempre el mismo) */}
        <FiVolume2
          size={24}
          className="sm:h-[18px] sm:w-[18px] md:h-5 md:w-5"
        />
      </button>
    </>
  );
}

export default MusicPlayer;
