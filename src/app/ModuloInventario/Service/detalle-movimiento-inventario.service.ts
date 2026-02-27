import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { DetalleMovimientoInventarioRequest, DetalleMovimientoInventarioResponse } from '../Entidad/detalle-movimiento-inventario.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetalleMovimientoInventarioService {
  private readonly apiUrl = `${environment.apiUrl}/detalle-movimiento-inventario`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<DetalleMovimientoInventarioResponse[]> {
    return this.http.get<DetalleMovimientoInventarioResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<DetalleMovimientoInventarioResponse> {
    return this.http.get<DetalleMovimientoInventarioResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByMovimientoId(movimientoId: number): Observable<DetalleMovimientoInventarioResponse[]> {
    return this.http.get<DetalleMovimientoInventarioResponse[]>(`${this.apiUrl}/movimiento/${movimientoId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(detalle: DetalleMovimientoInventarioRequest): Observable<DetalleMovimientoInventarioResponse> {
    return this.http.post<DetalleMovimientoInventarioResponse>(this.apiUrl, detalle).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, detalle: DetalleMovimientoInventarioRequest): Observable<DetalleMovimientoInventarioResponse> {
    return this.http.put<DetalleMovimientoInventarioResponse>(`${this.apiUrl}/${id}`, detalle).pipe(
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
      errorMessage = 'Detalle de movimiento no encontrado';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
