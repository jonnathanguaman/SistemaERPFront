export interface CategoriaRequest {
  nombre: string;
  codigo: string;
}

export interface CategoriaResponse {
  id: number;
  nombre: string;
  codigo: string;
  activo: boolean;
}
