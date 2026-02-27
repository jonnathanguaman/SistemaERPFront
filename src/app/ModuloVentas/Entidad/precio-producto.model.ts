export interface PrecioProductoRequest {
  listaPreciosId: number;
  productoId: number;
  precio: number;
  precioMinimo?: number;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  activo?: boolean;
}

export interface PrecioProductoResponse {
  id: number;
  listaPreciosId: number;
  listaPreciosNombre: string;
  listaPreciosCodigo: string;
  listaPreciosTipo: string;
  productoId: number;
  precio: number;
  precioMinimo?: number;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
  estaVigente: boolean;
}
