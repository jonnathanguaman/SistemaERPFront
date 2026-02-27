import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { SubgrupoRequest, SubgrupoResponse } from '../Entidad/subgrupo.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubgrupoService {
  private readonly apiUrl = `${environment.apiUrl}/subgrupo`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<SubgrupoResponse[]> {
    return this.http.get<SubgrupoResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<SubgrupoResponse> {
    return this.http.get<SubgrupoResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(subgrupo: SubgrupoRequest): Observable<SubgrupoResponse> {
    return this.http.post<SubgrupoResponse>(this.apiUrl, subgrupo).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, subgrupo: SubgrupoRequest): Observable<SubgrupoResponse> {
    return this.http.put<SubgrupoResponse>(`${this.apiUrl}/${id}`, subgrupo).pipe(
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
      errorMessage = 'Subgrupo no encontrado';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
