export interface ProductoLoteRequest {
  numeroLote: string;
  fechaVencimiento: Date;
  fechaFabricacion: Date;
}

export interface ProductoLoteResponse {
  id: number;
  numeroLote: string;
  fechaVencimiento: Date;
  fechaFabricacion: Date;
  activo: boolean;
}
