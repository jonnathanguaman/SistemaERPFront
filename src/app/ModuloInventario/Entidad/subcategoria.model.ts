export interface SubcategoriaRequest {
  nombre: string;
  codigo: string;
  categoriaId: number;
}

export interface SubcategoriaResponse {
  id: number;
  nombre: string;
  codigo: string;
  categoriaId: number;
  categoriaNombre: string;
  activo: boolean;
}
