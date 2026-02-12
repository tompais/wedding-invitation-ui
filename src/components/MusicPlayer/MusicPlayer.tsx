"use client";

import { useState, useEffect } from "react";
import { FiVolume2 } from "react-icons/fi";
import "./MusicPlayer.css";
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
  const { isMuted, toggleMute, audioProps } = useAudio(
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
        className="music-player-button"
        onClick={handleClick}
        title={isMuted ? "Activar música" : "Mutear música"}
        aria-label={isMuted ? "Activar música" : "Mutear música"}
      >
        {/* Tooltip que se muestra solo al inicio y si está muteado */}
        {showTooltip && isMuted && (
          <span className="tooltip">🎵 Activa la música</span>
        )}

        {/* Icono de volumen (siempre el mismo) */}
        <FiVolume2 size={24} />
      </button>
    </>
  );
}

export default MusicPlayer;
