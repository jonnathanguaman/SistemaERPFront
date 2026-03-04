export interface NotaCreditoRequest {
  numeroNotaCredito: string;
  facturaId: number;
  clienteId: number;
  fechaEmision: string;
  tipoNota: string;
  motivo: string;
  subtotal: number;
  descuentoMonto: number;
  impuestoMonto: number;
  total: number;
  afectaInventario: boolean;
  movimientoInventarioId?: number;
  observaciones?: string;
  autorizadoSri: boolean;
  numeroAutorizacion?: string;
  claveAcceso?: string;
}

export interface NotaCreditoResponse {
  id: number;
  numeroNotaCredito: string;
  facturaId: number;
  facturaNumero?: string;
  clienteId: number;
  clienteNombre?: string;
  fechaEmision: string;
  tipoNota: string;
  motivo: string;
  subtotal: number;
  descuentoMonto: number;
  impuestoMonto: number;
  total: number;
  estado: string;
  afectaInventario: boolean;
  movimientoInventarioId?: number;
  observaciones?: string;
  numeroAutorizacion?: string;
  claveAcceso?: string;
  usuarioCreacionId?: number;
  activo?: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  puedeAplicarse?: boolean;
  cantidadDetalles?: number;
}
