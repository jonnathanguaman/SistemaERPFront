export interface CuentaContableRequest {
  nombre: string;
  descripcion: string;
}

export interface CuentaContableResponse {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}
