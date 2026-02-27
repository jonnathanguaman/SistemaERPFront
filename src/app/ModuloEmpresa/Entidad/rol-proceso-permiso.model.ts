export interface RolProcesoPermiso {
  id?: number;
  rolEmpresaId: number;
  accionProcesoId: number;
}

export interface RolProcesoPermisoDetalle extends RolProcesoPermiso {
  rolNombre?: string;
  empresaNombre?: string;
  accionProcesoCodigo?: string;
  procesoNombre?: string;
}
