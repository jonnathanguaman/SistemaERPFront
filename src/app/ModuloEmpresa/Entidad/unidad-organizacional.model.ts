export interface UnidadOrganizacional {
  id?: number;
  nombre: string;
  tipo: string;
  empresaId: number;
  unidadPadreId?: number;
  activo?: boolean;
}

export interface UnidadOrganizacionalDetalle extends UnidadOrganizacional {
  empresaNombre?: string;
  unidadPadreNombre?: string;
}
