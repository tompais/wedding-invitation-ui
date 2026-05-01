"use client";

import Lottie from "lottie-react";
import { useState } from "react";
import { MdNature } from "react-icons/md";
import party from "../../assets/animatios/party.json";
import rings from "../../assets/animatios/rings.json";
import { EVENTS, LOCATIONS } from "../../constants/events";
import { useModal } from "../../hooks/useModal";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
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
  // Hook personalizado para animaciones de scroll (solo usamos el ref)
  const [ref] = useScrollAnimation(0.2);

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
      <section
        className="w-full px-8 py-4 text-center"
        style={{ backgroundColor: "var(--hueso)", color: "var(--text-dark)" }}
        ref={ref}
      >
        <div className="mx-auto max-w-[1200px]">
          <h2
            className="mb-6 text-4xl font-semibold tracking-[0.05em]"
            style={{
              color: "var(--bourdeaux-dark)",
              fontFamily: "var(--font-display)",
            }}
          >
            Las fechas
          </h2>

          <div className="mb-4 flex flex-wrap justify-center gap-8">
            {/* Bloque del Evento Civil */}
            <div className="event-card">
              <div>
                <h3>{civilEvent.title}</h3>
                <div className="mx-auto my-6 max-h-[110px] max-w-[110px] opacity-80">
                  <Lottie
                    animationData={rings}
                    loop
                    className="!h-full !w-full"
                  />
                </div>
                <p>{civilEvent.date}</p>
                <p>{civilEvent.time}</p>
                <p>{LOCATIONS.civil.name}</p>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleOpenMap("civil")}
                >
                  Ver ubicación
                </button>
              </div>
            </div>

            {/* Bloque del Evento Fiesta */}
            <div className="event-card">
              <div>
                <h3>{fiestaEvent.title}</h3>
                <div className="mx-auto my-6 max-h-[110px] max-w-[110px] opacity-80">
                  <Lottie
                    animationData={party}
                    loop
                    className="!h-full !w-full"
                  />
                </div>
                <p>{fiestaEvent.date}</p>
                <p>{fiestaEvent.time}</p>
                <p>{LOCATIONS.fiesta.name}</p>

                {/* Mostrar nota de evento al aire libre si corresponde */}
                {fiestaEvent.isOutdoor && (
                  <p className="mt-4 text-sm opacity-85">
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

              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleOpenMap("fiesta")}
                >
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
