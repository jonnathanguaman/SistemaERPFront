export interface ProvinciaRequest {
  paisId: number;
  codigo?: string;
  nombre: string;
  activo?: boolean;
}

export interface ProvinciaResponse {
  id: number;
  paisId: number;
  paisNombre: string;
  codigo?: string;
  nombre: string;
  activo: boolean;
}
