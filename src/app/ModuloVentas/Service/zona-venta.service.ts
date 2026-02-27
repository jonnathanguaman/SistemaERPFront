import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { ZonaVentaRequest, ZonaVentaResponse } from '../Entidad/zona-venta.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ZonaVentaService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/zonas-venta`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ZonaVentaResponse[]> {
    return this.http.get<ZonaVentaResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<ZonaVentaResponse> {
    return this.http.get<ZonaVentaResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivos(): Observable<ZonaVentaResponse[]> {
    return this.http.get<ZonaVentaResponse[]>(`${this.apiUrl}/activas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCodigo(codigo: string): Observable<ZonaVentaResponse> {
    return this.http.get<ZonaVentaResponse>(`${this.apiUrl}/codigo/${codigo}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(zonaVenta: ZonaVentaRequest): Observable<ZonaVentaResponse> {
    return this.http.post<ZonaVentaResponse>(this.apiUrl, zonaVenta).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  update(id: number, zonaVenta: ZonaVentaRequest): Observable<ZonaVentaResponse> {
    return this.http.put<ZonaVentaResponse>(`${this.apiUrl}/${id}`, zonaVenta).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
