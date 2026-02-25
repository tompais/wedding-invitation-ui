/**
 * DATOS DE UBICACIONES
 *
 * Centraliza información de los eventos:
 * - Nombres de lugares
 * - URLs de Google Maps
 * - Embeds para mapas interactivos
 *
 * Principio DRY: evita duplicación de datos
 */

export interface Location {
  name: string;
  url: string;
  embed: string;
}

export interface Event {
  title: string;
  date: string;
  location: string;
  isOutdoor?: boolean;
}

export const LOCATIONS: Record<"civil" | "fiesta", Location> = {
  civil: {
    name: "Registro Civil de Morón",
    url: "https://www.google.com/maps/place/Registro+Civil+De+Mor%C3%B3n/@-34.6518427,-58.6185155,17z/data=!3m1!4b1!4m6!3m5!1s0x95bcc76436153c09:0xfb17b30b3561ee05!8m2!3d-34.6518427!4d-58.6159406!16s%2Fg%2F11ckqszpfc?entry=ttu&g_ep=EgoyMDI2MDEyOC4wIKXMDSoASAFQAw%3D%3D",
    embed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3281.2846321503536!2d-58.61851522346026!3d-34.65184268763234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcc76436153c09%3A0xfb17b30b3561ee05!2sRegistro%20Civil%20De%20Mor%C3%B3n!5e0!3m2!1ses!2sar!4v1700000000000",
  },
  fiesta: {
    name: "Paraguay 3569, Benavidez",
    url: "https://www.google.com/maps/place/Paraguay+3569,+B1621CIM+Benavidez,+Provincia+de+Buenos+Aires/@-34.4181447,-58.7191291,17z/data=!3m1!4b1!4m6!3m5!1s0x95bca1eb64a6ccf3:0xae7d2d9c9b3ef375!8m2!3d-34.4181447!4d-58.7165542!16s%2Fg%2F11s_vkbdql?entry=ttu&g_ep=EgoyMDI2MDIyMi4wIKXMDSoASAFQAw%3D%3D",
    embed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3280.8!2d-58.7165542!3d-34.4181447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bca1eb64a6ccf3%3A0xae7d2d9c9b3ef375!2sParaguay%203569%2C%20Benavidez!5e0!3m2!1ses!2sar!4v1700000000000",
  },
} as const;

/**
 * INFORMACIÓN DE EVENTOS
 *
 * Datos centralizados sobre cada ceremonia
 */
export const EVENTS: Record<"civil" | "fiesta", Event> = {
  civil: {
    title: "Civil",
    date: "Jueves 30 de Julio de 2026",
    location: LOCATIONS.civil.name,
  },
  fiesta: {
    title: "Fiesta",
    date: "Sábado 1 de Agosto de 2026",
    location: LOCATIONS.fiesta.name,
    isOutdoor: true,
  },
} as const;
