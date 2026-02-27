export interface ReporteJerarquico {
  id?: number;
  subordinadoId: number;
  subordinadoNombre?: string;
  subordinadoCedula?: string;
  jefeId: number;
  jefeNombre?: string;
  jefeCedula?: string;
  fechaInicio: string;
  fechaFin?: string;
  activo: boolean;
}

export interface ReporteJerarquicoDetalle extends ReporteJerarquico {
}
