"use client";

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
      <section
        className="w-full px-8 py-24 text-center"
        style={{ backgroundColor: "var(--hueso)", color: "var(--text-dark)" }}
        ref={ref}
      >
        <div className="mx-auto max-w-[1200px]">
          <h2
            className="font-display mb-14 text-4xl font-semibold tracking-[0.05em]"
            style={{ color: "var(--bourdeaux-dark)" }}
          >
            Las fechas
          </h2>

          <div className="mb-8 flex flex-wrap justify-center gap-8">
            {/* Bloque del Evento Civil */}
            <div
              className="flex max-w-[500px] min-w-[320px] flex-1 flex-col justify-between rounded-2xl px-10 py-10"
              style={{
                backgroundColor: "var(--bourdeaux)",
                boxShadow: "0 10px 26px rgba(114, 47, 55, 0.25)",
              }}
            >
              <div>
                <h3
                  className="font-display mb-3 text-3xl font-semibold tracking-[0.03em]"
                  style={{ color: "var(--hueso)" }}
                >
                  {civilEvent.title}
                </h3>
                <div className="mx-auto my-6 max-h-[140px] max-w-[140px] opacity-80">
                  <Lottie
                    animationData={rings}
                    loop
                    className="!h-full !w-full"
                  />
                </div>
                <p
                  className="my-1.5 text-base"
                  style={{ color: "var(--text-light)" }}
                >
                  {civilEvent.date}
                </p>
                <p
                  className="my-1.5 text-base"
                  style={{ color: "var(--text-light)" }}
                >
                  {LOCATIONS.civil.name}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <button
                  className="hover:border-hueso cursor-pointer rounded-[22px] border px-6 py-2.5 transition-all duration-300 ease-in-out"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "var(--hueso)",
                    color: "var(--hueso)",
                  }}
                  onClick={() => handleOpenMap("civil")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--bourdeaux-dark)";
                    e.currentTarget.style.color = "var(--hueso)";
                    e.currentTarget.style.borderColor = "var(--hueso)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--hueso)";
                    e.currentTarget.style.borderColor = "var(--hueso)";
                  }}
                >
                  Ver ubicación
                </button>
              </div>
            </div>

            {/* Bloque del Evento Fiesta */}
            <div
              className="flex max-w-[500px] min-w-[320px] flex-1 flex-col justify-between rounded-2xl px-10 py-10"
              style={{
                backgroundColor: "var(--bourdeaux)",
                boxShadow: "0 10px 26px rgba(114, 47, 55, 0.25)",
              }}
            >
              <div>
                <h3
                  className="font-display mb-3 text-3xl font-semibold tracking-[0.03em]"
                  style={{ color: "var(--hueso)" }}
                >
                  {fiestaEvent.title}
                </h3>
                <div className="mx-auto my-6 max-h-[140px] max-w-[140px] opacity-80">
                  <Lottie
                    animationData={party}
                    loop
                    className="!h-full !w-full"
                  />
                </div>
                <p
                  className="my-1.5 text-base"
                  style={{ color: "var(--text-light)" }}
                >
                  {fiestaEvent.date}
                </p>
                <p
                  className="my-1.5 text-base"
                  style={{ color: "var(--text-light)" }}
                >
                  {LOCATIONS.fiesta.name}
                </p>

                {/* Mostrar nota de evento al aire libre si corresponde */}
                {fiestaEvent.isOutdoor && (
                  <p
                    className="mt-4 text-sm opacity-85"
                    style={{ color: "var(--text-muted)" }}
                  >
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
                  className="hover:border-hueso cursor-pointer rounded-[22px] border px-6 py-2.5 transition-all duration-300 ease-in-out"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "var(--hueso)",
                    color: "var(--hueso)",
                  }}
                  onClick={() => handleOpenMap("fiesta")}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--bourdeaux-dark)";
                    e.currentTarget.style.color = "var(--hueso)";
                    e.currentTarget.style.borderColor = "var(--hueso)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--hueso)";
                    e.currentTarget.style.borderColor = "var(--hueso)";
                  }}
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
