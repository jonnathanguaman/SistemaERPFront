import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { DetalleCotizacionRequest, DetalleCotizacionResponse } from '../Entidad/detalle-cotizacion.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetalleCotizacionService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/detalles-cotizacion`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<DetalleCotizacionResponse[]> {
    return this.http.get<DetalleCotizacionResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<DetalleCotizacionResponse> {
    return this.http.get<DetalleCotizacionResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCotizacion(cotizacionId: number): Observable<DetalleCotizacionResponse[]> {
    return this.http.get<DetalleCotizacionResponse[]>(`${this.apiUrl}/cotizacion/${cotizacionId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByProducto(productoId: number): Observable<DetalleCotizacionResponse[]> {
    return this.http.get<DetalleCotizacionResponse[]>(`${this.apiUrl}/producto/${productoId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(detalle: DetalleCotizacionRequest): Observable<DetalleCotizacionResponse> {
    return this.http.post<DetalleCotizacionResponse>(this.apiUrl, detalle).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, detalle: DetalleCotizacionRequest): Observable<DetalleCotizacionResponse> {
    return this.http.put<DetalleCotizacionResponse>(`${this.apiUrl}/${id}`, detalle).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en la operación';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status === 404) {
      errorMessage = 'Detalle de cotización no encontrado';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
