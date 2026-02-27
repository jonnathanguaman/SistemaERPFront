export interface LineaNegocioRequest {
  nombre: string;
  codigo: string;
}

export interface LineaNegocioResponse {
  id: number;
  nombreLinea: string;
  codigoLinea: string;
  activo: boolean;
}
