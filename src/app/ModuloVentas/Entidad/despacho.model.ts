export interface DespachoRequest {
  numeroDespacho: string;
  numeroGuiaRemision?: string;
  ordenVentaId: number;
  bodegaId: number;
  fechaDespacho: string;
  fechaEntregaEstimada?: string;
  responsablePreparacionId?: number;
  responsableDespachoId?: number;
  transportista?: string;
  placaVehiculo?: string;
  conductor?: string;
  cedulaConductor?: string;
  direccionEntregaId?: number;
  direccionEntregaTexto?: string;
  movimientoInventarioId?: number;
  observaciones?: string;
  nombreQuienRecibe?: string;
  cedulaQuienRecibe?: string;
  firmaRecibido?: string;
  usuarioCreacionId?: number;
}

export interface DespachoResponse {
  id: number;
  numeroDespacho: string;
  numeroGuiaRemision?: string;
  ordenVentaId: number;
  ordenVentaNumero?: string;
  bodegaId: number;
  fechaDespacho: string;
  fechaEntregaEstimada?: string;
  fechaEntregaReal?: string;
  responsablePreparacionId?: number;
  responsableDespachoId?: number;
  transportista?: string;
  placaVehiculo?: string;
  conductor?: string;
  cedulaConductor?: string;
  direccionEntregaId?: number;
  direccionEntregaTexto?: string;
  estado: string;
  movimientoInventarioId?: number;
  observaciones?: string;
  firmaRecibido?: string;
  nombreQuienRecibe?: string;
  cedulaQuienRecibe?: string;
  usuarioCreacionId?: number;
  activo?: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
  puedeEditarse?: boolean;
  cantidadDetalles?: number;
}
