import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { FacturaRequest, FacturaResponse } from '../Entidad/factura.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FacturaService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/facturas`;

  constructor(private readonly http: HttpClient) {}

  obtenerTodos(): Observable<FacturaResponse[]> {
    return this.http.get<FacturaResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorId(id: number): Observable<FacturaResponse> {
    return this.http.get<FacturaResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorCliente(clienteId: number): Observable<FacturaResponse[]> {
    const params = new HttpParams().set('clienteId', clienteId.toString());
    return this.http.get<FacturaResponse[]>(`${this.apiUrl}/por-cliente`, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorOrdenVenta(ordenVentaId: number): Observable<FacturaResponse[]> {
    const params = new HttpParams().set('ordenVentaId', ordenVentaId.toString());
    return this.http.get<FacturaResponse[]>(`${this.apiUrl}/por-orden-venta`, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorEstado(estado: string): Observable<FacturaResponse[]> {
    const params = new HttpParams().set('estado', estado);
    return this.http.get<FacturaResponse[]>(`${this.apiUrl}/por-estado`, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  crear(factura: FacturaRequest): Observable<FacturaResponse> {
    return this.http.post<FacturaResponse>(this.apiUrl, factura).pipe(
      catchError(this.handleError)
    );
  }

  actualizar(id: number, factura: FacturaRequest): Observable<FacturaResponse> {
    return this.http.put<FacturaResponse>(`${this.apiUrl}/${id}`, factura).pipe(
      catchError(this.handleError)
    );
  }

  registrarPago(id: number, monto: number): Observable<FacturaResponse> {
    return this.http.post<FacturaResponse>(`${this.apiUrl}/${id}/registrar-pago`, { monto }).pipe(
      catchError(this.handleError)
    );
  }

  autorizarSri(id: number, numeroAutorizacion: string, claveAcceso: string): Observable<FacturaResponse> {
    return this.http.post<FacturaResponse>(`${this.apiUrl}/${id}/autorizar-sri`, {
      numeroAutorizacion,
      claveAcceso
    }).pipe(
      catchError(this.handleError)
    );
  }

  anular(id: number): Observable<FacturaResponse> {
    return this.http.post<FacturaResponse>(`${this.apiUrl}/${id}/anular`, {}).pipe(
      catchError(this.handleError)
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en la operación';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.mensaje || error.error?.message || error.message || errorMessage;
    }
    
    console.error('Error en FacturaService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
