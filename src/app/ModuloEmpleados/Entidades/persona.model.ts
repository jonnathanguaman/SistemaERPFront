/**
 * Modelo de Persona - Empleado
 * Representa los datos de un empleado en el sistema
 */
export interface Persona {
  id?: number;
  nombre: string;
  cedula: string;
  direccion: string;
  telefono: string;
  email: string;
  activo?: boolean;
}

/**
 * DTO para crear/actualizar persona
 */
export interface PersonaRequest {
  nombre: string;
  cedula: string;
  direccion: string;
  telefono: string;
  email: string;
}

/**
 * DTO de respuesta del servidor
 */
export interface PersonaResponse {
  id: number;
  nombre: string;
  cedula: string;
  direccion: string;
  telefono: string;
  email: string;
  activo: boolean;
}
