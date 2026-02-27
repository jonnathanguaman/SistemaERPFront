import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { ProductoExistenciasRequest, ProductoExistenciasResponse } from '../Entidad/producto-existencias.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoExistenciasService {
  private readonly apiUrl = `${environment.apiUrl}/producto-existencias`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ProductoExistenciasResponse[]> {
    return this.http.get<ProductoExistenciasResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<ProductoExistenciasResponse> {
    return this.http.get<ProductoExistenciasResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(existencias: ProductoExistenciasRequest): Observable<ProductoExistenciasResponse> {
    return this.http.post<ProductoExistenciasResponse>(this.apiUrl, existencias).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, existencias: ProductoExistenciasRequest): Observable<ProductoExistenciasResponse> {
    return this.http.put<ProductoExistenciasResponse>(`${this.apiUrl}/${id}`, existencias).pipe(
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
      errorMessage = 'Existencias no encontradas';
    } else if (error.status === 409) {
      errorMessage = 'Ya existe un registro de existencias para esta combinación producto-bodega-lote';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
