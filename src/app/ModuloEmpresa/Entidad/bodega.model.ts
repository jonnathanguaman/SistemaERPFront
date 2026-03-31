export interface BodegaRequest {
  codigo: string;
  nombre: string;
  direccion: string;
  empresaId: number;
  unidadOrganizacionalId?: number;
  bodegaTipo?: 'CONTABLE' | 'VENTA';
  bodegaPadreId?: number;
  permiteBodegaOrigen?: boolean;
  permiteBodegaDestino?: boolean;
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
  bodegaTipo?: 'CONTABLE' | 'VENTA';
  bodegaPadreId?: number;
  bodegaPadreNombre?: string;
  permiteBodegaOrigen?: boolean;
  permiteBodegaDestino?: boolean;
  activo: boolean;
}
