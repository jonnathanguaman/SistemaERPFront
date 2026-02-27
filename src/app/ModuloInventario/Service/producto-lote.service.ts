import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { ProductoLoteRequest, ProductoLoteResponse } from '../Entidad/producto-lote.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoLoteService {
  private readonly apiUrl = `${environment.apiUrl}/producto-lote`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ProductoLoteResponse[]> {
    return this.http.get<ProductoLoteResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<ProductoLoteResponse> {
    return this.http.get<ProductoLoteResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(productoLote: ProductoLoteRequest): Observable<ProductoLoteResponse> {
    return this.http.post<ProductoLoteResponse>(this.apiUrl, productoLote).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, productoLote: ProductoLoteRequest): Observable<ProductoLoteResponse> {
    return this.http.put<ProductoLoteResponse>(`${this.apiUrl}/${id}`, productoLote).pipe(
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
      errorMessage = 'Lote de producto no encontrado';
    } else if (error.status === 409) {
      errorMessage = 'Ya existe un lote con ese número';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
