/**
 * Modelo para registro de nuevos usuarios
 */
export interface RegisterRequest {
  personaId: number;
  username: string;
  password: string;
  rolesIds: number[];
}
