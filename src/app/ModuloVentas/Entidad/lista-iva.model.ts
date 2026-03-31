export interface ListaIvaResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoIva?: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  activo: boolean;
  estaVigente: boolean;
}
