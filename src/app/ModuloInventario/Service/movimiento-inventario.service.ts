import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { MovimientoInventarioRequest, MovimientoInventarioResponse } from '../Entidad/movimiento-inventario.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovimientoInventarioService {
  private readonly apiUrl = `${environment.apiUrl}/movimiento-inventario`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<MovimientoInventarioResponse[]> {
    return this.http.get<MovimientoInventarioResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<MovimientoInventarioResponse> {
    return this.http.get<MovimientoInventarioResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(movimiento: MovimientoInventarioRequest): Observable<MovimientoInventarioResponse> {
    return this.http.post<MovimientoInventarioResponse>(this.apiUrl, movimiento).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, movimiento: MovimientoInventarioRequest): Observable<MovimientoInventarioResponse> {
    return this.http.put<MovimientoInventarioResponse>(`${this.apiUrl}/${id}`, movimiento).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  confirmar(id: number): Observable<MovimientoInventarioResponse> {
    return this.http.put<MovimientoInventarioResponse>(`${this.apiUrl}/${id}/confirmar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  contabilizar(id: number): Observable<MovimientoInventarioResponse> {
    return this.http.put<MovimientoInventarioResponse>(`${this.apiUrl}/${id}/contabilizar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  anular(id: number): Observable<MovimientoInventarioResponse> {
    return this.http.put<MovimientoInventarioResponse>(`${this.apiUrl}/${id}/anular`, {}).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en la operación';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status === 404) {
      errorMessage = 'Movimiento de inventario no encontrado';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
