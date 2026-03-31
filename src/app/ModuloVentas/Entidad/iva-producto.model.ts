export interface IvaProductoRequest {
  listaIvaId: number;
  productoId: number;
  impuestoPorcentaje: number;
  impuestoCodigo?: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  activo: boolean;
}

export interface IvaProductoResponse {
  id: number;
  listaIvaId: number;
  listaIvaNombre: string;
  listaIvaCodigo: string;
  listaIvaTipo: string;
  productoId: number;
  impuestoPorcentaje: number;
  impuestoCodigo?: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
  estaVigente: boolean;
}
