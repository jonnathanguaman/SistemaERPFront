export interface ContactoClienteRequest {
  clienteId: number;
  nombres: string;
  apellidos: string;
  area?: string;
  cargo?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  esPrincipal?: boolean;
  recibeFacturas?: boolean;
  recibeCotizaciones?: boolean;
  observaciones?: string;
}

export interface ContactoClienteResponse {
  id: number;
  clienteId: number;
  clienteNombre?: string;
  nombres: string;
  apellidos: string;
  nombreCompleto?: string;
  area?: string;
  cargo?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  esPrincipal?: boolean;
  recibeFacturas?: boolean;
  recibeCotizaciones?: boolean;
  observaciones?: string;
  activo?: boolean;
  tieneContactoValido?: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
}
