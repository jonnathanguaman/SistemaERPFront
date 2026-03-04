import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { DetalleDespachoRequest, DetalleDespachoResponse } from '../Entidad/detalle-despacho.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetalleDespachoService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/detalles-despacho`;

  constructor(private readonly http: HttpClient) {}

  save(request: DetalleDespachoRequest): Observable<DetalleDespachoResponse> {
    return this.http.post<DetalleDespachoResponse>(this.apiUrl, request).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  update(id: number, request: DetalleDespachoRequest): Observable<DetalleDespachoResponse> {
    return this.http.put<DetalleDespachoResponse>(`${this.apiUrl}/${id}`, request).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<DetalleDespachoResponse> {
    return this.http.get<DetalleDespachoResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByDespacho(despachoId: number): Observable<DetalleDespachoResponse[]> {
    return this.http.get<DetalleDespachoResponse[]>(`${this.apiUrl}/despacho/${despachoId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByProducto(productoId: number): Observable<DetalleDespachoResponse[]> {
    return this.http.get<DetalleDespachoResponse[]>(`${this.apiUrl}/producto/${productoId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findIncompletos(despachoId: number): Observable<DetalleDespachoResponse[]> {
    return this.http.get<DetalleDespachoResponse[]>(`${this.apiUrl}/despacho/${despachoId}/incompletos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  countByDespacho(despachoId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/despacho/${despachoId}/contar`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  deleteByDespacho(despachoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/despacho/${despachoId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || error.message || errorMessage;
    }
    return throwError(() => new Error(errorMessage));
  }
}
