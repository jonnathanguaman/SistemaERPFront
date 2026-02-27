import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { ProductoTipoRequest, ProductoTipoResponse } from '../Entidad/producto-tipo.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoTipoService {
  private readonly apiUrl = `${environment.apiUrl}/producto-tipo`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ProductoTipoResponse[]> {
    return this.http.get<ProductoTipoResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<ProductoTipoResponse> {
    return this.http.get<ProductoTipoResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(productoTipo: ProductoTipoRequest): Observable<ProductoTipoResponse> {
    return this.http.post<ProductoTipoResponse>(this.apiUrl, productoTipo).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, productoTipo: ProductoTipoRequest): Observable<ProductoTipoResponse> {
    return this.http.put<ProductoTipoResponse>(`${this.apiUrl}/${id}`, productoTipo).pipe(
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
      errorMessage = 'Tipo de producto no encontrado';
    } else if (error.status === 409) {
      errorMessage = 'Ya existe un tipo de producto con ese nombre';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
