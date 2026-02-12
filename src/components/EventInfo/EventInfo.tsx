"use client";

import "./EventInfo.css";
import Lottie from "lottie-react";
import rings from "../../assets/animatios/rings.json";
import party from "../../assets/animatios/party.json";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useModal } from "../../hooks/useModal";
import { MdNature } from "react-icons/md";
import { useState } from "react";
import { LOCATIONS, EVENTS } from "../../constants/events";
import Modal from "../common/Modal/Modal";

/**
 * COMPONENTE: EventInfo
 *
 * Responsabilidad (SOLID - Single Responsibility):
 * - Mostrar información de las ceremonias (Civil y Fiesta)
 * - Permitir ver ubicaciones en modal con mapa embebido
 *
 * Principios aplicados:
 * - DRY: Datos centralizados en constants/events.js
 * - KISS: Lógica simple usando hooks personalizados
 * - Clean Code: Nombres descriptivos y comentarios claros
 *
 * Mejoras implementadas:
 * - Hook useModal para gestionar estado del modal
 * - Componente Modal reutilizable
 * - Constantes importadas desde /constants
 */
function EventInfo() {
  // Hook personalizado para animaciones de scroll
  const [ref, _isVisible] = useScrollAnimation(0.2);

  // Hook personalizado para gestionar el modal
  const {
    isOpen: isModalOpen,
    open: openModal,
    close: closeModal,
  } = useModal();

  // Estado: guarda qué ubicación mostrar ('civil' o 'fiesta')
  const [selectedLocation, setSelectedLocation] = useState<
    "civil" | "fiesta" | null
  >(null);

  /**
   * Abre el modal con el mapa de una ubicación específica
   */
  const handleOpenMap = (locationKey: "civil" | "fiesta") => {
    setSelectedLocation(locationKey);
    openModal();
  };

  /**
   * Cierra el modal y limpia la ubicación seleccionada
   */
  const handleCloseMap = () => {
    closeModal();
    setSelectedLocation(null);
  };

  // Obtener datos del evento civil y fiesta desde las constantes
  const civilEvent = EVENTS.civil;
  const fiestaEvent = EVENTS.fiesta;

  return (
    <>
      <section className="event" ref={ref}>
        <div className="event-container">
          <h2>Las fechas</h2>

          <div className="event-blocks-container">
            {/* Bloque del Evento Civil */}
            <div className="event-block">
              <div>
                <h3>{civilEvent.title}</h3>
                <div className="decorative-animation">
                  <Lottie animationData={rings} loop />
                </div>
                <p>{civilEvent.date}</p>
                <p>{LOCATIONS.civil.name}</p>
              </div>

              <div className="event-buttons">
                <button onClick={() => handleOpenMap("civil")}>
                  Ver ubicación
                </button>
              </div>
            </div>

            {/* Bloque del Evento Fiesta */}
            <div className="event-block">
              <div>
                <h3>{fiestaEvent.title}</h3>
                <div className="decorative-animation">
                  <Lottie animationData={party} loop />
                </div>
                <p>{fiestaEvent.date}</p>
                <p>{LOCATIONS.fiesta.name}</p>

                {/* Mostrar nota de evento al aire libre si corresponde */}
                {fiestaEvent.isOutdoor && (
                  <p className="event-note">
                    <MdNature
                      size={20}
                      style={{
                        display: "inline-block",
                        marginRight: "0.5rem",
                        verticalAlign: "middle",
                      }}
                    />{" "}
                    Evento al aire libre
                  </p>
                )}
              </div>

              <div className="event-buttons">
                <button onClick={() => handleOpenMap("fiesta")}>
                  Ver ubicación
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal reutilizable para mostrar el mapa de Google */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseMap}
        title={selectedLocation ? LOCATIONS[selectedLocation].name : ""}
      >
        {selectedLocation && (
          <iframe
            title={LOCATIONS[selectedLocation].name}
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: "12px" }}
            src={LOCATIONS[selectedLocation].embed}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </Modal>
    </>
  );
}

export default EventInfo;
