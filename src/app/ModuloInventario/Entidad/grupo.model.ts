export interface GrupoRequest {
  nombre: string;
  codigo: string;
}

export interface GrupoResponse {
  id: number;
  nombre: string;
  codigo: string;
  activo: boolean;
}
