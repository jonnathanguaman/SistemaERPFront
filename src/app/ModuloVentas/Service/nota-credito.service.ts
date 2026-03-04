import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { NotaCreditoRequest, NotaCreditoResponse } from '../Entidad/nota-credito.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotaCreditoService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/notas-credito`;

  constructor(private readonly http: HttpClient) {}

  obtenerTodos(): Observable<NotaCreditoResponse[]> {
    return this.http.get<NotaCreditoResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerActivos(): Observable<NotaCreditoResponse[]> {
    return this.http.get<NotaCreditoResponse[]>(`${this.apiUrl}/activos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorId(id: number): Observable<NotaCreditoResponse> {
    return this.http.get<NotaCreditoResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorNumero(numeroNotaCredito: string): Observable<NotaCreditoResponse> {
    return this.http.get<NotaCreditoResponse>(`${this.apiUrl}/numero/${numeroNotaCredito}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorFactura(facturaId: number): Observable<NotaCreditoResponse[]> {
    return this.http.get<NotaCreditoResponse[]>(`${this.apiUrl}/factura/${facturaId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorCliente(clienteId: number): Observable<NotaCreditoResponse[]> {
    return this.http.get<NotaCreditoResponse[]>(`${this.apiUrl}/cliente/${clienteId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorEstado(estado: string): Observable<NotaCreditoResponse[]> {
    return this.http.get<NotaCreditoResponse[]>(`${this.apiUrl}/estado/${estado}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  crear(notaCredito: NotaCreditoRequest): Observable<NotaCreditoResponse> {
    return this.http.post<NotaCreditoResponse>(this.apiUrl, notaCredito).pipe(
      catchError(this.handleError)
    );
  }

  actualizar(id: number, notaCredito: NotaCreditoRequest): Observable<NotaCreditoResponse> {
    return this.http.put<NotaCreditoResponse>(`${this.apiUrl}/${id}`, notaCredito).pipe(
      catchError(this.handleError)
    );
  }

  aplicar(id: number): Observable<NotaCreditoResponse> {
    return this.http.patch<NotaCreditoResponse>(`${this.apiUrl}/${id}/aplicar`, null).pipe(
      catchError(this.handleError)
    );
  }

  anular(id: number): Observable<NotaCreditoResponse> {
    return this.http.patch<NotaCreditoResponse>(`${this.apiUrl}/${id}/anular`, null).pipe(
      catchError(this.handleError)
    );
  }

  autorizarSri(id: number, numeroAutorizacion: string, claveAcceso: string): Observable<NotaCreditoResponse> {
    const params = new HttpParams()
      .set('numeroAutorizacion', numeroAutorizacion)
      .set('claveAcceso', claveAcceso);
    return this.http.patch<NotaCreditoResponse>(`${this.apiUrl}/${id}/autorizar-sri`, null, { params }).pipe(
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
    
    return throwError(() => new Error(errorMessage));
  }
}
