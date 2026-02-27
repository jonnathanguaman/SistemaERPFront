export interface FormaPagoRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  requiereReferencia?: boolean;
  activo?: boolean;
}

export interface FormaPagoResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  requiereReferencia: boolean;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
}
