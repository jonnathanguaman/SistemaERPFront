export interface CentroCostosRequest {
  nombre: string;
  descripcion: string;
}

export interface CentroCostosResponse {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}
