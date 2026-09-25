/**
 * Usuario fijo para la fase local (sin autenticación).
 * Cuando se añada auth real, este es el único punto de cambio:
 * reemplazar por `session.user.id`.
 */
export const FIXED_USER_ID = 'local-user';
