/**
 * Modelo de respuesta de autenticación
 */
export interface AuthResponse {
  token: string;
  username: string;
  nombre: string;
  roles?: string[];
  usuarioId?: number;
  empresaId?: number;
}
