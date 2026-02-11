/**
 * DOMAIN LAYER: Guest Service
 *
 * Responsabilidad única: Lógica de negocio relacionada con invitados
 * Principios: SOLID (Single Responsibility), DRY, Dependency Injection
 *
 * Este servicio encapsula toda la lógica de búsqueda y manipulación de invitados,
 * separándola de la UI y facilitando testing.
 */

/**
 * Busca un invitado por código
 * @param {Array} guestList - Lista de invitados
 * @param {string} code - Código a buscar
 * @returns {Object|null} - Invitado encontrado o null
 */
export const findGuestByCode = (guestList, code) => {
  if (!code || !guestList) return null;

  return (
    guestList.find(
      (guest) => guest.codigo.toUpperCase() === code.toUpperCase()
    ) || null
  );
};

/**
 * Obtiene el grupo familiar de un invitado
 * @param {Array} guestList - Lista de invitados
 * @param {string} guestCode - Código del invitado
 * @returns {Array} - Miembros de la familia
 */
export const getFamilyMembers = (guestList, guestCode) => {
  if (!guestCode || !guestList) return [];

  const familyCode = guestCode.substring(0, 12); // FLIA-SOMMA-xxx o AMIG-MAI-xxx

  return guestList.filter(
    (guest) => guest.codigo.substring(0, 12) === familyCode
  );
};

/**
 * Inicializa el estado de confirmación de familia
 * @param {Array} familyMembers - Miembros de la familia
 * @param {string} currentGuestCode - Código del invitado actual
 * @returns {Object} - Estado inicial de confirmación
 */
export const initializeFamilyConfirmation = (
  familyMembers,
  currentGuestCode
) => {
  const confirmation = {};

  familyMembers.forEach((member) => {
    confirmation[member.codigo] = member.codigo === currentGuestCode;
  });

  return confirmation;
};

/**
 * Obtiene los miembros de familia confirmados
 * @param {Object} familyConfirm - Estado de confirmación
 * @param {Array} guestList - Lista de invitados
 * @returns {Array} - Miembros confirmados
 */
export const getConfirmedFamilyMembers = (familyConfirm, guestList) => {
  return Object.entries(familyConfirm)
    .filter(([_, isConfirmed]) => isConfirmed)
    .map(([codigo]) => guestList.find((g) => g.codigo === codigo))
    .filter(Boolean); // Filtrar undefined
};
