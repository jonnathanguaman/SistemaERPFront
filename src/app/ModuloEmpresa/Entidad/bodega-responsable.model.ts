export interface BodegaResponsable {
  id?: number;
  bodegaId: number;
  personaEmpresaId: number;
  fechaInicio: string;
  fechaFin?: string;
  activo: boolean;
}

export interface BodegaResponsableDetalle extends BodegaResponsable {
  bodegaNombre?: string;
  bodegaCodigo?: string;
  personaNombre?: string;
  personaCedula?: string;
}
