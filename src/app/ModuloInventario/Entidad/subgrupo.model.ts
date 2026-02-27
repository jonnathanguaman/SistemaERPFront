export interface SubgrupoRequest {
  nombre: string;
  codigo: string;
  grupoId: number;
}

export interface SubgrupoResponse {
  id: number;
  nombre: string;
  codigo: string;
  grupoId: number;
  grupoNombre: string;
  activo: boolean;
}
