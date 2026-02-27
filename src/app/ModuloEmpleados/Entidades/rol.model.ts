/**
 * Modelo de datos para el módulo de Roles de Acceso
 */

/**
 * Interfaz para el objeto Rol completo
 */
export interface RolAcceso {
  id?: number;
  nombre: string;
  activo?: boolean;
}

/**
 * DTO para crear/actualizar un rol
 * Coincide con RolesAccesoRequestDTO del backend
 */
export interface RolAccesoRequest {
  nombre: string;
}

/**
 * DTO para la respuesta del servidor
 * Coincide con RolesAccesoResponseDTO del backend
 */
export interface RolAccesoResponse {
  id: number;
  nombre: string;
  activo: boolean;
}
