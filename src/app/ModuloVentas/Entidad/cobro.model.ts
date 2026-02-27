export interface CobroRequest {
  numeroCobro: string;
  clienteId: number;
  fechaCobro: string;
  formaPagoId: number;
  bancoId?: number;
  numeroDocumento?: string;
  fechaDocumento?: string;
  montoTotal: number;
  cajaId?: number;
  cajeroId?: number;
  tipoCambio?: number;
  moneda?: string;
  observaciones?: string;
}

export interface CobroResponse {
  id: number;
  numeroCobro: string;
  clienteId: number;
  clienteNombre: string;
  fechaCobro: string;
  formaPagoId: number;
  formaPagoNombre: string;
  bancoId?: number;
  numeroDocumento?: string;
  fechaDocumento?: string;
  montoTotal: number;
  montoAplicado: number;
  montoDisponible: number;
  cajaId?: number;
  cajeroId?: number;
  movimientoCajaId?: number;
  tipoCambio?: number;
  moneda?: string;
  estado: string;
  observaciones?: string;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  usuarioCreacionId?: number;
  fechaConfirmacion?: string;
  confirmadoPorId?: number;
  fechaAnulacion?: string;
  anuladoPorId?: number;
  motivoAnulacion?: string;
  tieneSaldoDisponible?: boolean;
}
