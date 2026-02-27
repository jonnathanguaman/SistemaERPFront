export interface ProductoRequest {
  sku: string;
  codigoBarras: string;
  codigoInterno: string;
  productoNombre: string;
  presentacion: string;
  temperatura: 'AMBIENTE' | 'REFRIGERADO' | 'CONGELADO';
  peso: number;
  volumen: number;
  unidadMedida: string;
  cantidadMaxima: number;
  cantidadMinimo: number;
  cantidadPorCaja: number;
  estado: boolean;
  fechaAlta?: Date;
  lineaNegocioId: number;
  subgrupoId: number;
  productoTipoId: number;
}

export interface ProductoResponse {
  id: number;
  sku: string;
  codigoBarras: string;
  codigoInterno: string;
  productoNombre: string;
  presentacion: string;
  temperatura: string;
  peso: number;
  volumen: number;
  unidadMedida: string;
  cantidadMaxima: number;
  cantidadMinimo: number;
  cantidadPorCaja: number;
  estado: boolean;
  fechaAlta: Date;
  activo: boolean;
  lineaNegocioId: number;
  lineaNegocioNombre: string;
  subgrupoId: number;
  subgrupoNombre: string;
  productoTipoId: number;
  productoTipoNombre: string;
}
