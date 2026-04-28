export interface EmpresaRequest {
  nit: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  necesitaDespacho: boolean;
}

export interface EmpresaResponse {
  id: number;
  nit: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  necesitaDespacho: boolean;
  activo: boolean;
}
