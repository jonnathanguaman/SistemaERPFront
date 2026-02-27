export interface PersonaEmpresaRol {
  id?: number;
  personaEmpresaId: number;
  rolEmpresaId: number;
  fechaAsignacion: string;
  fechaFin?: string;
  activo: boolean;
}

export interface PersonaEmpresaRolDetalle extends PersonaEmpresaRol {
  personaNombre?: string;
  personaCedula?: string;
  empresaNombre?: string;
  rolNombre?: string;
}
