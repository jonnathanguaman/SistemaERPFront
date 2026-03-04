export interface DetalleCotizacionRequest {
  cotizacionId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  impuestoPorcentaje: number;
  observaciones?: string;
}

export interface DetalleCotizacionResponse {
  id: number;
  cotizacionId: number;
  cotizacionNumero?: string;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  subtotal: number;
  impuestoPorcentaje: number;
  impuestoMonto: number;
  total: number;
  observaciones?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
}
