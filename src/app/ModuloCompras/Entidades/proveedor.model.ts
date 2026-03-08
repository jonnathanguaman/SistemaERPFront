/**
 * Modelo de Proveedor
 * Representa los datos de un proveedor en el sistema
 */
export interface Proveedor {
  id?: number;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  razonSocial: string;
  nombreComercial?: string;
  tipoProveedor?: string;
  categoria?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  sitioWeb?: string;
  contactoPrincipal?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  condicionPagoId?: number;
  diasCredito?: number;
  descuentoComercial?: number;
  banco?: string;
  tipoCuenta?: string;
  numeroCuenta?: string;
  estado?: string;
  observaciones?: string;
  usuarioCreacionId?: number;
  fechaCreacion?: string;
  fechaModificacion?: string;
  activo?: boolean;
}

/**
 * DTO para crear/actualizar proveedor
 */
export interface ProveedorRequest {
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  razonSocial: string;
  nombreComercial?: string;
  tipoProveedor?: string;
  categoria?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  sitioWeb?: string;
  contactoPrincipal?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  condicionPagoId?: number;
  diasCredito?: number;
  descuentoComercial?: number;
  banco?: string;
  tipoCuenta?: string;
  numeroCuenta?: string;
  estado?: string;
  observaciones?: string;
}

/**
 * DTO de respuesta del servidor
 */
export interface ProveedorResponse {
  id: number;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
  razonSocial: string;
  nombreComercial?: string;
  tipoProveedor?: string;
  categoria?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  sitioWeb?: string;
  contactoPrincipal?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  condicionPagoId?: number;
  diasCredito?: number;
  descuentoComercial?: number;
  banco?: string;
  tipoCuenta?: string;
  numeroCuenta?: string;
  estado?: string;
  observaciones?: string;
  usuarioCreacionId?: number;
  fechaCreacion?: string;
  fechaModificacion?: string;
  activo: boolean;
}
