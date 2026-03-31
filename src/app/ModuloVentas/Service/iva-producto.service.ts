import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IvaProductoRequest, IvaProductoResponse } from '../Entidad/iva-producto.model';

@Injectable({
  providedIn: 'root'
})
export class IvaProductoService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/ivas-producto`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<IvaProductoResponse[]> {
    return this.http.get<IvaProductoResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<IvaProductoResponse> {
    return this.http.get<IvaProductoResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByProducto(productoId: number): Observable<IvaProductoResponse[]> {
    return this.http.get<IvaProductoResponse[]>(`${this.apiUrl}/producto/${productoId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(ivaProducto: IvaProductoRequest): Observable<IvaProductoResponse> {
    return this.http.post<IvaProductoResponse>(this.apiUrl, ivaProducto).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  update(id: number, ivaProducto: IvaProductoRequest): Observable<IvaProductoResponse> {
    return this.http.put<IvaProductoResponse>(`${this.apiUrl}/${id}`, ivaProducto).pipe(
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

  findVigenteByProducto(productoId: number): Observable<IvaProductoResponse> {
    return this.http.get<IvaProductoResponse>(`${this.apiUrl}/producto/${productoId}/vigente`).pipe(
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
    return throwError(() => new Error(errorMessage));
  }
}
