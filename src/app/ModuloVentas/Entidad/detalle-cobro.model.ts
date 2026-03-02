export interface DetalleCobroRequest {
  cobroId: number;
  cuentaPorCobrarId: number;
  facturaId: number;
  montoAplicado: number;
  fechaAplicacion?: string;
  observaciones?: string;
}

export interface DetalleCobroResponse {
  id: number;
  cobroId: number;
  cobroNumero: string;
  cuentaPorCobrarId: number;
  facturaId: number;
  facturaNumero: string;
  montoAplicado: number;
  fechaAplicacion: string;
  observaciones?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
}
