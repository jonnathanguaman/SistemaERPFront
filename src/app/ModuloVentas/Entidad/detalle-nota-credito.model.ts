export interface DetalleNotaCreditoRequest {
  notaCreditoId: number;
  detalleFacturaId?: number;
  productoId: number;
  productoCodigo?: string;
  productoNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  impuestoPorcentaje: number;
  impuestoMonto: number;
  total: number;
  observaciones?: string;
}

export interface DetalleNotaCreditoResponse {
  id: number;
  notaCreditoId: number;
  notaCreditoNumero?: string;
  detalleFacturaId?: number;
  productoId: number;
  productoCodigo?: string;
  productoNombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  impuestoPorcentaje: number;
  impuestoMonto: number;
  total: number;
  observaciones?: string;
}
