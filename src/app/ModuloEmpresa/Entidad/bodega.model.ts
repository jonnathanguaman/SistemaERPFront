export interface BodegaRequest {
  codigo: string;
  nombre: string;
  direccion: string;
  empresaId: number;
  unidadOrganizacionalId?: number;
}

export interface BodegaResponse {
  id: number;
  codigo: string;
  nombre: string;
  direccion: string;
  empresaId: number;
  empresaNombre: string;
  unidadOrganizacionalId?: number;
  unidadOrganizacionalNombre?: string;
  activo: boolean;
}
