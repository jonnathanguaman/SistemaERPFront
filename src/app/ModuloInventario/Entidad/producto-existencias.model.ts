export interface ProductoExistenciasRequest {
  productoId: number;
  bodegaId: number;
  productoLoteId?: number;
  cantidadFisica: number;
  cantidadDisponible: number;
  cantidadReservada: number;
  costoPromedio: number;
  ubicacion: string;
  activo: boolean;
}

export interface ProductoExistenciasResponse {
  id: number;
  productoId: number;
  productoNombre: string;
  bodegaId: number;
  bodegaNombre: string;
  productoLoteId?: number;
  loteNumero?: string;
  cantidadFisica: number;
  cantidadDisponible: number;
  cantidadReservada: number;
  costoPromedio: number;
  ubicacion: string;
  activo: boolean;
}
