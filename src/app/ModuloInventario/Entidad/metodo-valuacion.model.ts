export interface MetodoValuacionRequest {
  nombre: string;
  descripcion: string;
}

export interface MetodoValuacionResponse {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}
