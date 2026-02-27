export interface PermisoDirectoPersonal {
  id?: number;
  personaEmpresaId: number;
  accionProcesoId: number;
  fechaInicio: string;
  fechaFin?: string;
}

export interface PermisoDirectoPersonalDetalle extends PermisoDirectoPersonal {
  personaNombre?: string;
  personaCedula?: string;
  empresaNombre?: string;
  accionProcesoCodigo?: string;
  procesoNombre?: string;
}
