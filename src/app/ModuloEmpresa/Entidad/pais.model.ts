export interface PaisRequest {
  codigoIso2: string;
  nombre: string;
  activo?: boolean;
}

export interface PaisResponse {
  id: number;
  codigoIso2: string;
  nombre: string;
  activo: boolean;
}
