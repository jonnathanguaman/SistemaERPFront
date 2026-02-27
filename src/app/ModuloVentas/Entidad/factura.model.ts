export interface FacturaRequest {
  numeroFactura: string;
  ordenVentaId: number;
  despachoId?: number;
  clienteId: number;
  direccionFacturacionId?: number;
  fechaEmision: string;
  fechaVencimiento: string;
  formaPagoId: number;
  referenciaPago?: string;
  subtotal: number;
  descuentoMonto: number;
  impuestoMonto: number;
  total: number;
  saldoPendiente?: number;
  observaciones?: string;
  autorizadoSri: boolean;
  numeroAutorizacion?: string;
  claveAcceso?: string;
  emailDestinatario?: string;
}

export interface FacturaResponse {
  id: number;
  numeroFactura: string;
  ordenVentaId: number;
  ordenVentaNumero?: string;
  despachoId?: number;
  despachoNumero?: string;
  clienteId: number;
  clienteNombre?: string;
  direccionFacturacionId?: number;
  direccionFacturacion?: string;
  fechaEmision: string;
  fechaVencimiento: string;
  formaPagoId: number;
  formaPagoNombre?: string;
  referenciaPago?: string;
  subtotal: number;
  descuentoMonto: number;
  impuestoMonto: number;
  total: number;
  saldoPendiente?: number;
  estado: string;
  observaciones?: string;
  autorizadoSri: boolean;
  numeroAutorizacion?: string;
  claveAcceso?: string;
  emailDestinatario?: string;
  fechaCreacion?: string;
  fechaModificacion?: string;
}
