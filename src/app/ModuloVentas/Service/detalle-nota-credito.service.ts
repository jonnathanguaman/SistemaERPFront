import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { DetalleNotaCreditoRequest, DetalleNotaCreditoResponse } from '../Entidad/detalle-nota-credito.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetalleNotaCreditoService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/detalles-nota-credito`;

  constructor(private readonly http: HttpClient) {}

  obtenerTodos(): Observable<DetalleNotaCreditoResponse[]> {
    return this.http.get<DetalleNotaCreditoResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorId(id: number): Observable<DetalleNotaCreditoResponse> {
    return this.http.get<DetalleNotaCreditoResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorNotaCredito(notaCreditoId: number): Observable<DetalleNotaCreditoResponse[]> {
    return this.http.get<DetalleNotaCreditoResponse[]>(`${this.apiUrl}/nota-credito/${notaCreditoId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorProducto(productoId: number): Observable<DetalleNotaCreditoResponse[]> {
    return this.http.get<DetalleNotaCreditoResponse[]>(`${this.apiUrl}/producto/${productoId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  crear(detalle: DetalleNotaCreditoRequest): Observable<DetalleNotaCreditoResponse> {
    return this.http.post<DetalleNotaCreditoResponse>(this.apiUrl, detalle).pipe(
      catchError(this.handleError)
    );
  }

  actualizar(id: number, detalle: DetalleNotaCreditoRequest): Observable<DetalleNotaCreditoResponse> {
    return this.http.put<DetalleNotaCreditoResponse>(`${this.apiUrl}/${id}`, detalle).pipe(
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
