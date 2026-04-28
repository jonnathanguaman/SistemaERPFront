/**
 * Modelo para crear una persona con credenciales de acceso y roles
 */
export interface PersonaConCredencialesRequest {
  // Datos de la persona
  nombre: string;
  cedula: string;
  direccion: string;
  telefono: string;
  email: string;
  
  // Credenciales (opcionales)
  username?: string;
  password?: string;
  
  // Roles (opcionales)
  rolesIds?: number[];

  // Empresa para crear relación directa persona-empresa
  empresaId?: number;

  // Rol dentro de la empresa (opcional)
  rolEmpresaId?: number;
}
