/**
 * Modelo de datos para la asignación de roles a empleados
 */

/**
 * Interfaz para PersonaRol completo
 */
export interface PersonaRol {
  id?: number;
  personaId: number;
  rolId: number;
  activo?: boolean;
}

/**
 * DTO para crear/asignar un rol a una persona
 * Coincide con PersonaRolRequestDTO del backend
 */
export interface PersonaRolRequest {
  personaId: number;
  rolId: number;
}

/**
 * DTO para la respuesta del servidor
 * Coincide con PersonaRolResponseDTO del backend
 */
export interface PersonaRolResponse {
  id: number;
  personaId: number;
  rolId: number;
  activo: boolean;
}

/**
 * Interfaz extendida para mostrar información completa en la vista
 * Incluye nombre del empleado y nombre del rol
 */
export interface PersonaRolDetalle {
  id: number;
  personaId: number;
  personaNombre: string;
  personaCedula: string;
  rolId: number;
  rolNombre: string;
  activo: boolean;
}
