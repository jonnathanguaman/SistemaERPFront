export interface ProductoConfiguracionContableRequest {
  cuentaContableId: number;
  centroCostosId: number;
  metodoValuacionId: number;
  productoId: number;
  activo: boolean;
}

export interface ProductoConfiguracionContableResponse {
  id: number;
  cuentaContableId: number;
  cuentaContableNombre: string;
  centroCostosId: number;
  centroCostosNombre: string;
  metodoValuacionId: number;
  metodoValuacionNombre: string;
  productoId: number;
  productoNombre: string;
  activo: boolean;
}
