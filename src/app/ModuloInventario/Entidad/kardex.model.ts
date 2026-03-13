export interface KardexRegistroResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  productoSku: string;
  bodegaId: number;
  bodegaNombre: string;
  fechaMovimiento: string;
  tipoMovimientoCodigo: string;
  numeroOperacion: string;
  documentoReferencia: string;
  descripcion: string;
  movimientoInventarioId: number;
  entradaCantidad: number | null;
  entradaValorUnitario: number | null;
  entradaValorTotal: number | null;
  salidaCantidad: number | null;
  salidaValorUnitario: number | null;
  salidaValorTotal: number | null;
  saldoCantidad: number | null;
  saldoValorUnitario: number | null;
  saldoValorTotal: number | null;
  metodoValuacion: string;
  ordenRegistro: number;
}

export interface KardexCapaFifoResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  bodegaId: number;
  bodegaNombre: string;
  fechaIngreso: string;
  costoUnitario: number;
  cantidadOriginal: number;
  cantidadDisponible: number;
  agotada: boolean;
}

export interface KardexFiltro {
  productoId: number | null;
  bodegaId: number | null;
  desde: string;
  hasta: string;
}