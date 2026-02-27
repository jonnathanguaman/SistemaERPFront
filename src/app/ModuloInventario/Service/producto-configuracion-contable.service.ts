import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { ProductoConfiguracionContableRequest, ProductoConfiguracionContableResponse } from '../Entidad/producto-configuracion-contable.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoConfiguracionContableService {
  private readonly apiUrl = `${environment.apiUrl}/producto-configuracion-contable`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ProductoConfiguracionContableResponse[]> {
    return this.http.get<ProductoConfiguracionContableResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<ProductoConfiguracionContableResponse> {
    return this.http.get<ProductoConfiguracionContableResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(configuracion: ProductoConfiguracionContableRequest): Observable<ProductoConfiguracionContableResponse> {
    return this.http.post<ProductoConfiguracionContableResponse>(this.apiUrl, configuracion).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, configuracion: ProductoConfiguracionContableRequest): Observable<ProductoConfiguracionContableResponse> {
    return this.http.put<ProductoConfiguracionContableResponse>(`${this.apiUrl}/${id}`, configuracion).pipe(
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
      errorMessage = 'Configuración contable no encontrada';
    } else if (error.status === 409) {
      errorMessage = 'Ya existe una configuración contable para este producto';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
