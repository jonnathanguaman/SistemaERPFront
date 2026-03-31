/**
 * Modelo de Recepción de Inventario
 * Representa una recepción de mercancía con sus detalles
 */
export interface RecepcionInventario {
  id?: number;
  numeroRecepcion: string;
  ordenCompraId: number;
  proveedorId: number;
  proveedorRazonSocial?: string;
  fechaRecepcion: string;
  bodegaId: number;
  bodegaNombre?: string;
  responsableRecepcionId?: number;
  numeroFacturaProveedor?: string;
  numeroGuiaRemision?: string;
  estado: string;
  observaciones?: string;
  movimientoInventarioId?: number;
  usuarioCreacionId?: number;
  usuarioConfirmacionId?: number;
  fechaCreacion?: string;
  fechaModificacion?: string;
  fechaConfirmacion?: string;
  activo?: boolean;
  detalles?: DetalleRecepcion[];
}

/**
 * DTO para crear/actualizar recepción de inventario
 */
export interface RecepcionInventarioRequest {
  numeroRecepcion: string;
  ordenCompraId: number;
  proveedorId: number;
  fechaRecepcion: string;
  bodegaId: number;
  responsableRecepcionId?: number;
  numeroFacturaProveedor?: string;
  numeroGuiaRemision?: string;
  estado?: string;
  observaciones?: string;
  usuarioCreacionId?: number;
  detalles: DetalleRecepcionRequest[]; // Obligatorio según backend
}

/**
 * DTO de respuesta de recepción de inventario
 */
export interface RecepcionInventarioResponse {
  id: number;
  numeroRecepcion: string;
  ordenCompraId: number;
  proveedorId: number;
  proveedorRazonSocial?: string;
  fechaRecepcion: string;
  bodegaId: number;
  bodegaNombre?: string;
  responsableRecepcionId?: number;
  numeroFacturaProveedor?: string;
  numeroGuiaRemision?: string;
  estado: string;
  observaciones?: string;
  movimientoInventarioId?: number;
  usuarioCreacionId?: number;
  usuarioConfirmacionId?: number;
  fechaCreacion: string;
  fechaModificacion?: string;
  fechaConfirmacion?: string;
  activo: boolean;
  detalles?: DetalleRecepcionResponse[];
}

/**
 * Modelo de Detalle de Recepción
 * Representa el detalle de productos recibidos
 */
export interface DetalleRecepcion {
  id?: number;
  recepcionId?: number;
  detalleOrdenCompraId: number;
  productoId: number;
  productoNombre?: string;
  productoSku?: string;
  loteId?: number;
  numeroLote?: string;
  fechaFabricacion?: string;
  fechaVencimiento?: string;
  cantidadOrdenada: number;
  cantidadRecibida: number;
  cantidadRechazada?: number;
  costoUnitario: number;
  costoTotal?: number;
  estadoCalidad?: string;
  motivoRechazo?: string;
  observaciones?: string;
}

/**
 * DTO para crear/actualizar detalle de recepción
 */
export interface DetalleRecepcionRequest {
  recepcionId?: number;
  detalleOrdenCompraId?: number;
  productoId: number;
  loteId?: number;
  numeroLote?: string;
  fechaFabricacion?: string;
  fechaVencimiento?: string;
  cantidadOrdenada: number;
  cantidadRecibida: number;
  cantidadRechazada?: number;
  costoUnitario: number;
  estadoCalidad?: string;
  motivoRechazo?: string;
  observaciones?: string;
}

/**
 * DTO de respuesta de detalle de recepción
 */
export interface DetalleRecepcionResponse {
  id: number;
  recepcionId: number;
  detalleOrdenCompraId: number;
  productoId: number;
  productoNombre?: string;
  productoSku?: string;
  bodegaId?: number;
  bodegaNombre?: string;
  loteId?: number;
  numeroLote?: string;
  fechaFabricacion?: string;
  fechaVencimiento?: string;
  cantidadOrdenada: number;
  cantidadRecibida: number;
  cantidadRechazada: number;
  costoUnitario: number;
  costoTotal: number;
  estadoCalidad?: string;
  motivoRechazo?: string;
  observaciones?: string;
}

/**
 * Estados posibles de una recepción
 */
export enum EstadoRecepcion {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  CANCELADA = 'CANCELADA'
}

/**
 * Estados de calidad de un producto recibido
 */
export enum EstadoCalidad {
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  INSPECCION = 'INSPECCION'
}
