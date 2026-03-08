/**
 * Modelo de Orden de Compra
 * Representa una orden de compra con sus detalles
 */
export interface OrdenCompra {
  id?: number;
  numeroOrden: string;
  proveedorId: number;
  proveedorRazonSocial?: string;
  fechaOrden: string;
  fechaEntregaEsperada?: string;
  fechaEntregaReal?: string;
  bodegaId: number;
  bodegaNombre?: string;
  direccionEntrega?: string;
  compradorId?: number;
  aprobadorId?: number;
  condicionPagoId?: number;
  diasCredito?: number;
  formaPagoId?: number;
  subtotal: number;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  impuestoMonto: number;
  total: number;
  estado: string;
  observaciones?: string;
  terminosCondiciones?: string;
  usuarioCreacionId?: number;
  usuarioAprobacionId?: number;
  fechaCreacion?: string;
  fechaModificacion?: string;
  fechaAprobacion?: string;
  activo?: boolean;
  detalles?: DetalleOrdenCompra[];
}

/**
 * DTO para crear/actualizar orden de compra
 */
export interface OrdenCompraRequest {
  numeroOrden: string;
  proveedorId: number;
  fechaOrden: string;
  fechaEntregaEsperada?: string;
  fechaEntregaReal?: string;
  bodegaId: number;
  direccionEntrega?: string;
  compradorId?: number;
  aprobadorId?: number;
  condicionPagoId?: number;
  diasCredito?: number;
  formaPagoId?: number;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  estado?: string;
  observaciones?: string;
  terminosCondiciones?: string;
  usuarioCreacionId?: number;
  detalles: DetalleOrdenCompraRequest[];
}

/**
 * DTO de respuesta del servidor
 */
export interface OrdenCompraResponse {
  id: number;
  numeroOrden: string;
  proveedorId: number;
  proveedorRazonSocial: string;
  fechaOrden: string;
  fechaEntregaEsperada?: string;
  fechaEntregaReal?: string;
  bodegaId: number;
  bodegaNombre: string;
  direccionEntrega?: string;
  compradorId?: number;
  aprobadorId?: number;
  condicionPagoId?: number;
  diasCredito?: number;
  formaPagoId?: number;
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  impuestoMonto: number;
  total: number;
  estado: string;
  observaciones?: string;
  terminosCondiciones?: string;
  usuarioCreacionId?: number;
  usuarioAprobacionId?: number;
  fechaCreacion: string;
  fechaModificacion: string;
  fechaAprobacion?: string;
  activo: boolean;
  detalles: DetalleOrdenCompraResponse[];
}

/**
 * Modelo de Detalle de Orden de Compra
 */
export interface DetalleOrdenCompra {
  id?: number;
  ordenCompraId?: number;
  productoId: number;
  productoNombre?: string;
  productoSku?: string;
  cantidadOrdenada: number;
  cantidadRecibida?: number;
  cantidadPendiente?: number;
  precioUnitario: number;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  subtotal?: number;
  impuestoPorcentaje: number;
  impuestoMonto?: number;
  total?: number;
  observaciones?: string;
  activo?: boolean;
}

/**
 * DTO para crear/actualizar detalle de orden de compra
 */
export interface DetalleOrdenCompraRequest {
  productoId: number;
  cantidadOrdenada: number;
  precioUnitario: number;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  impuestoPorcentaje: number;
  observaciones?: string;
}

/**
 * DTO de respuesta del servidor para detalle
 */
export interface DetalleOrdenCompraResponse {
  id: number;
  ordenCompraId: number;
  productoId: number;
  productoNombre: string;
  productoSku: string;
  cantidadOrdenada: number;
  cantidadRecibida: number;
  cantidadPendiente: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  subtotal: number;
  impuestoPorcentaje: number;
  impuestoMonto: number;
  total: number;
  observaciones?: string;
  activo: boolean;
}
