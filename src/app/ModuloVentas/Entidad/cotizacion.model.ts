export interface CotizacionRequest {
  numeroCotizacion: string;
  clienteId: number;
  contactoClienteId?: number;
  fechaCotizacion: string;
  fechaVencimiento: string;
  vendedorId: number;
  bodegaId: number;
  listaPreciosId: number;
  condicionPagoId: number;
  subtotal: number;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  impuestoMonto: number;
  total: number;
  observaciones?: string;
  terminosCondiciones?: string;
  tiempoEntrega?: string;
}

export interface CotizacionResponse {
  id: number;
  numeroCotizacion: string;
  clienteId: number;
  clienteNombre?: string;
  contactoClienteId?: number;
  contactoClienteNombre?: string;
  fechaCotizacion: string;
  fechaVencimiento: string;
  vendedorId: number;
  bodegaId: number;
  listaPreciosId: number;
  listaPreciosNombre?: string;
  condicionPagoId: number;
  condicionPagoNombre?: string;
  subtotal: number;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  subtotalConDescuento?: number;
  impuestoMonto: number;
  total: number;
  estado: string;
  ordenVentaId?: number;
  observaciones?: string;
  terminosCondiciones?: string;
  tiempoEntrega?: string;
  activo?: boolean;
  estaVencida?: boolean;
  puedeEditarse?: boolean;
  puedeConvertirse?: boolean;
  usuarioCreacionId?: number;
  usuarioAprobacionId?: number;
  fechaCreacion?: string;
  fechaModificacion?: string;
  fechaAprobacion?: string;
}
