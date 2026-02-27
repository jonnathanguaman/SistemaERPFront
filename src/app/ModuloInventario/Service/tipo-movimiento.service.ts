import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { TipoMovimientoRequest, TipoMovimientoResponse } from '../Entidad/tipo-movimiento.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoMovimientoService {
  private readonly apiUrl = `${environment.apiUrl}/tipo-movimiento`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<TipoMovimientoResponse[]> {
    return this.http.get<TipoMovimientoResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<TipoMovimientoResponse> {
    return this.http.get<TipoMovimientoResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(tipoMovimiento: TipoMovimientoRequest): Observable<TipoMovimientoResponse> {
    return this.http.post<TipoMovimientoResponse>(this.apiUrl, tipoMovimiento).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, tipoMovimiento: TipoMovimientoRequest): Observable<TipoMovimientoResponse> {
    return this.http.put<TipoMovimientoResponse>(`${this.apiUrl}/${id}`, tipoMovimiento).pipe(
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
      errorMessage = 'Tipo de movimiento no encontrado';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
