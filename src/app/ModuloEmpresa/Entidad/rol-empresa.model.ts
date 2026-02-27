export interface RolEmpresa {
  id?: number;
  nombre: string;
  descripcion?: string;
  empresaId: number;
  rolPadreId?: number;
}

export interface RolEmpresaDetalle extends RolEmpresa {
  empresaNombre?: string;
  empresaNit?: string;
  rolPadreNombre?: string;
}
