export interface EmpresaRequest {
  nit: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
}

export interface EmpresaResponse {
  id: number;
  nit: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  activo: boolean;
}
