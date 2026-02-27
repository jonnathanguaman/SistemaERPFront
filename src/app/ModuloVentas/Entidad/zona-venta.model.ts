export interface ZonaVentaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface ZonaVentaResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion: string;
}
