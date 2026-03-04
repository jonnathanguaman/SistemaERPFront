import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { DetalleOrdenVentaRequest, DetalleOrdenVentaResponse } from '../Entidad/detalle-orden-venta.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetalleOrdenVentaService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/detalles-orden-venta`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<DetalleOrdenVentaResponse[]> {
    return this.http.get<DetalleOrdenVentaResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<DetalleOrdenVentaResponse> {
    return this.http.get<DetalleOrdenVentaResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByOrdenVenta(ordenVentaId: number): Observable<DetalleOrdenVentaResponse[]> {
    return this.http.get<DetalleOrdenVentaResponse[]>(`${this.apiUrl}/orden-venta/${ordenVentaId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByProducto(productoId: number): Observable<DetalleOrdenVentaResponse[]> {
    return this.http.get<DetalleOrdenVentaResponse[]>(`${this.apiUrl}/producto/${productoId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(detalle: DetalleOrdenVentaRequest): Observable<DetalleOrdenVentaResponse> {
    return this.http.post<DetalleOrdenVentaResponse>(this.apiUrl, detalle).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, detalle: DetalleOrdenVentaRequest): Observable<DetalleOrdenVentaResponse> {
    return this.http.put<DetalleOrdenVentaResponse>(`${this.apiUrl}/${id}`, detalle).pipe(
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
      errorMessage = 'Detalle de orden de venta no encontrado';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
