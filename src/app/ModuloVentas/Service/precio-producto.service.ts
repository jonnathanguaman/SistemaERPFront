import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { PrecioProductoRequest, PrecioProductoResponse } from '../Entidad/precio-producto.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrecioProductoService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/precios-producto`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<PrecioProductoResponse[]> {
    return this.http.get<PrecioProductoResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<PrecioProductoResponse> {
    return this.http.get<PrecioProductoResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByListaPrecios(listaPreciosId: number): Observable<PrecioProductoResponse[]> {
    return this.http.get<PrecioProductoResponse[]>(`${this.apiUrl}/lista/${listaPreciosId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByProducto(productoId: number): Observable<PrecioProductoResponse[]> {
    return this.http.get<PrecioProductoResponse[]>(`${this.apiUrl}/producto/${productoId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findVigentesByProducto(productoId: number): Observable<PrecioProductoResponse[]> {
    return this.http.get<PrecioProductoResponse[]>(`${this.apiUrl}/producto/${productoId}/vigentes`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(precioProducto: PrecioProductoRequest): Observable<PrecioProductoResponse> {
    return this.http.post<PrecioProductoResponse>(this.apiUrl, precioProducto).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  update(id: number, precioProducto: PrecioProductoRequest): Observable<PrecioProductoResponse> {
    return this.http.put<PrecioProductoResponse>(`${this.apiUrl}/${id}`, precioProducto).pipe(
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
