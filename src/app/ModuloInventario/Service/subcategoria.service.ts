import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { SubcategoriaRequest, SubcategoriaResponse } from '../Entidad/subcategoria.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubcategoriaService {
  private readonly apiUrl = `${environment.apiUrl}/subcategoria`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<SubcategoriaResponse[]> {
    return this.http.get<SubcategoriaResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<SubcategoriaResponse> {
    return this.http.get<SubcategoriaResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(subcategoria: SubcategoriaRequest): Observable<SubcategoriaResponse> {
    return this.http.post<SubcategoriaResponse>(this.apiUrl, subcategoria).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, subcategoria: SubcategoriaRequest): Observable<SubcategoriaResponse> {
    return this.http.put<SubcategoriaResponse>(`${this.apiUrl}/${id}`, subcategoria).pipe(
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
      errorMessage = 'Subcategoría no encontrada';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
