export interface DetalleFacturaRequest {
  facturaId: number;
  productoId: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  impuestoPorcentaje?: number;
  impuestoMonto?: number;
  subtotal: number;
  total: number;
  observaciones?: string;
}

export interface DetalleFacturaResponse {
  id: number;
  facturaId: number;
  facturaNumero?: string;
  productoId: number;
  productoCodigo?: string;
  productoNombre?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje?: number;
  descuentoMonto?: number;
  impuestoPorcentaje?: number;
  impuestoMonto?: number;
  subtotal: number;
  total: number;
  observaciones?: string;
  fechaCreacion?: string;
}
