export interface PersonaEmpresa {
  id?: number;
  personaId: number;
  empresaId: number;
  unidadOrganizacionalId?: number;
  fechaIngreso: string;
  fechaSalida?: string;
  activo: boolean;
}

export interface PersonaEmpresaDetalle extends PersonaEmpresa {
  personaNombre?: string;
  personaCedula?: string;
  empresaNombre?: string;
  empresaNit?: string;
}
