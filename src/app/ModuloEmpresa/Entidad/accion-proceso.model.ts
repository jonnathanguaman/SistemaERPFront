import { Proceso } from './proceso.model';

export interface AccionProceso {
  id?: number;
  codigo: string;
  procesoId: number;
  proceso?: Proceso;
}

export interface AccionProcesoDetalle extends AccionProceso {
  procesoNombre?: string;
  procesoCodigo?: string;
}
