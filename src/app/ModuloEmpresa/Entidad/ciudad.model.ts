export interface CiudadRequest {
  provinciaId: number;
  codigo?: string;
  nombre: string;
  activo?: boolean;
}

export interface CiudadResponse {
  id: number;
  provinciaId: number;
  provinciaNombre: string;
  paisId: number;
  paisNombre: string;
  codigo?: string;
  nombre: string;
  activo: boolean;
}
