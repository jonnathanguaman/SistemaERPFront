export interface DetalleMovimientoInventarioRequest {
  productoId: number;
  loteId: number | null;
  cantidad: number;
  costoUnitario: number;
  ubicacionFisica: string;
  observaciones: string;
}

export interface DetalleMovimientoInventarioResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  loteId: number | null;
  loteNumero: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  ubicacionFisica: string;
  observaciones: string;
}
