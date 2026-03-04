export interface DetalleDespachoRequest {
  despachoId: number;
  detalleOrdenVentaId: number;
  productoId: number;
  loteId?: number;
  cantidadOrdenada: number;
  cantidadDespachada: number;
  observaciones?: string;
}

export interface DetalleDespachoResponse {
  id: number;
  despachoId: number;
  despachoNumero?: string;
  detalleOrdenVentaId: number;
  productoId: number;
  loteId?: number;
  cantidadOrdenada: number;
  cantidadDespachada: number;
  cantidadPendiente: number;
  observaciones?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
  estaCompleto: boolean;
}
