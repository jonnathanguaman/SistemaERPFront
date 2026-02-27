export interface DireccionClienteRequest {
  clienteId: number;
  tipoDireccion?: string;
  nombreDireccion?: string;
  direccion: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  referencia?: string;
  contacto?: string;
  telefono?: string;
  esPrincipal?: boolean;
  activo?: boolean;
}

export interface DireccionClienteResponse {
  id: number;
  clienteId: number;
  clienteNombre?: string;
  tipoDireccion?: string;
  nombreDireccion?: string;
  direccion: string;
  ciudad?: string;
  provincia?: string;
  codigoPostal?: string;
  referencia?: string;
  contacto?: string;
  telefono?: string;
  esPrincipal?: boolean;
  activo?: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  direccionCompleta?: string;
}
