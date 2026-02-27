export interface CuentaPorCobrarRequest {
  numeroCuenta: string;
  facturaId: number;
  clienteId: number;
  fechaEmision: string;
  fechaVencimiento: string;
  diasCredito: number;
  montoOriginal: number;
  montoPagado?: number;
  observaciones?: string;
}

export interface CuentaPorCobrarResponse {
  id: number;
  numeroCuenta: string;
  facturaId: number;
  facturaNumero?: string;
  clienteId: number;
  clienteNombre: string;
  fechaEmision: string;
  fechaVencimiento: string;
  diasCredito: number;
  montoOriginal: number;
  montoPagado: number;
  montoPendiente: number;
  estado: string;
  diasVencidos?: number;
  observaciones?: string;
  activo: boolean;
  estaVencida: boolean;
  tieneSaldoPendiente: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
}
