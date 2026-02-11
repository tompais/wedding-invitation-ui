import axios from "axios";
import { RSVP_CONFIG } from "../constants/rsvp";

/**
 * MÓDULO: API Helper con Axios
 *
 * Responsabilidad:
 * - Configurar axios para peticiones optimizadas
 * - Centralizar lógica de envío a Formspree
 *
 * Beneficios vs fetch con no-cors:
 * - Axios maneja mejor los errores
 * - Timeout configurado (evita esperas infinitas)
 * - Transformación automática de datos
 * - Interceptors para logging/debugging
 */

// Instancia configurada de axios para Formspree
const formspreeClient = axios.create({
  timeout: 10000, // 10 segundos máximo
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Envía confirmación de RSVP a Formspree
 *
 * @param {Object} data - Datos de confirmación
 * @returns {Promise} - Promesa con respuesta
 */
export const sendRSVPConfirmation = async (data) => {
  try {
    const response = await formspreeClient.post(RSVP_CONFIG.formspreeUrl, data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error enviando RSVP:", error);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};
