export interface ListaPreciosRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoLista?: string;
  monedaId: number;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  activo?: boolean;
}

export interface ListaPreciosResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoLista: string;
  monedaId: number;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
  estaVigente: boolean;
  cantidadPrecios: number;
}

export enum TipoLista {
  PUBLICO = 'PUBLICO',
  MAYORISTA = 'MAYORISTA',
  DISTRIBUIDOR = 'DISTRIBUIDOR',
  ESPECIAL = 'ESPECIAL'
}
