import { DetalleMovimientoInventarioRequest, DetalleMovimientoInventarioResponse } from './detalle-movimiento-inventario.model';

export interface MovimientoInventarioRequest {
  numeroMovimiento: string;
  tipoMovimientoId: number;
  bodegaOrigenId: number | null;
  bodegaDestinoId: number | null;
  fechaMovimiento: string;
  fechaContabilizacion: string;
  documentoReferencia: string;
  tipoDocumentoReferencia: string;
  motivo: string;
  observaciones: string;
  estado: 'BORRADOR' | 'CONFIRMADO' | 'CONTABILIZADO' | 'ANULADO';
  detalles: DetalleMovimientoInventarioRequest[];
}

export interface MovimientoInventarioResponse {
  id: number;
  numeroMovimiento: string;
  tipoMovimientoId: number;
  tipoMovimientoNombre: string;
  bodegaOrigenId: number | null;
  bodegaDestinoId: number | null;
  fechaMovimiento: string;
  fechaContabilizacion: string;
  documentoReferencia: string;
  tipoDocumentoReferencia: string;
  motivo: string;
  observaciones: string;
  estado: 'BORRADOR' | 'CONFIRMADO' | 'CONTABILIZADO' | 'ANULADO';
  detalles: DetalleMovimientoInventarioResponse[];
}
