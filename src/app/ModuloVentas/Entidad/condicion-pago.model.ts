export interface CondicionPagoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  diasCredito: number;
  requiereGarantia?: boolean;
  requiereAprobacionCredito?: boolean;
  permiteCuotas?: boolean;
  numeroCuotasMaximo?: number;
  esPredeterminado?: boolean;
}

export interface CondicionPagoResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  diasCredito: number;
  requiereGarantia: boolean;
  requiereAprobacionCredito: boolean;
  permiteCuotas: boolean;
  numeroCuotasMaximo?: number;
  esPredeterminado: boolean;
  activo: boolean;
  esContado: boolean;
  esCredito: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
}
