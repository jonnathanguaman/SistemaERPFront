import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { GrupoRequest, GrupoResponse } from '../Entidad/grupo.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private readonly apiUrl = `${environment.apiUrl}/grupo`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<GrupoResponse[]> {
    return this.http.get<GrupoResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<GrupoResponse> {
    return this.http.get<GrupoResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(grupo: GrupoRequest): Observable<GrupoResponse> {
    return this.http.post<GrupoResponse>(this.apiUrl, grupo).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, grupo: GrupoRequest): Observable<GrupoResponse> {
    return this.http.put<GrupoResponse>(`${this.apiUrl}/${id}`, grupo).pipe(
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
      errorMessage = 'Grupo no encontrado';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
