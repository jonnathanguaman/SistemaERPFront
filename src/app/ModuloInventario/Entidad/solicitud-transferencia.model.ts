export interface DetalleSolicitudTransferenciaRequest {
  productoId: number;
  loteId?: number;
  cantidadSolicitada: number;
  cantidadAprobada?: number;
  observaciones?: string;
}

export interface DetalleSolicitudTransferenciaResponse {
  id: number;
  solicitudId: number;
  productoId: number;
  loteId?: number;
  cantidadSolicitada: number;
  cantidadAprobada?: number;
  observaciones?: string;
}

export interface SolicitudTransferenciaRequest {
  numeroSolicitud: string;
  bodegaOrigenId: number;
  bodegaDestinoId: number;
  fechaSolicitud: string;
  fechaRequerida?: string;
  observaciones?: string;
  usuarioCreacionId: number;
  detalles: DetalleSolicitudTransferenciaRequest[];
}

export interface SolicitudTransferenciaResponse {
  id: number;
  numeroSolicitud: string;
  bodegaOrigenId: number;
  bodegaOrigenNombre: string;
  bodegaDestinoId: number;
  bodegaDestinoNombre: string;
  fechaSolicitud: string;
  fechaRequerida?: string;
  estado: 'BORRADOR' | 'ENVIADA' | 'APROBADA' | 'RECHAZADA' | 'COMPLETADA' | 'ANULADA';
  observaciones?: string;
  motivoRechazo?: string;
  movimientoInventarioId?: number;
  usuarioCreacionId: number;
  usuarioAprobacionId?: number;
  fechaCreacion: string;
  activo: boolean;
  detalles: DetalleSolicitudTransferenciaResponse[];
}
