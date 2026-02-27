export interface TipoMovimientoRequest {
  codigo: string;
  nombre: string;
  descripcion: string;
  afectaInventario: 'ENTRADA' | 'SALIDA' | 'NEUTRO';
  requiereAprobacion: boolean;
  generaAsiento: boolean;
}

export interface TipoMovimientoResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  afectaInventario: 'ENTRADA' | 'SALIDA' | 'NEUTRO';
  requiereAprobacion: boolean;
  generaAsiento: boolean;
  activo: boolean;
}
