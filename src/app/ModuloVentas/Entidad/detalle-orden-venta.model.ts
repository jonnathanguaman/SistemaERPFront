export interface DetalleOrdenVentaRequest {
  ordenVentaId: number;
  productoId: number;
  loteId?: number;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  impuestoPorcentaje: number;
  observaciones?: string;
}

export interface DetalleOrdenVentaResponse {
  id: number;
  ordenVentaId: number;
  ordenVentaNumero: string;
  productoId: number;
  loteId?: number;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  subtotal: number;
  impuestoPorcentaje: number;
  impuestoMonto: number;
  total: number;
  costoUnitario?: number;
  costoTotal?: number;
  margenUnitario?: number;
  margenPorcentaje?: number;
  observaciones?: string;
}
