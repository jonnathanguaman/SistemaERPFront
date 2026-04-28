import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaisRequest, PaisResponse } from '../Entidad/pais.model';

@Injectable({
  providedIn: 'root'
})
export class PaisService {
  private readonly apiUrl = `${environment.apiUrl}/empresa/paises`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<PaisResponse[]> {
    return this.http.get<PaisResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivos(): Observable<PaisResponse[]> {
    return this.http.get<PaisResponse[]>(`${this.apiUrl}/activos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(payload: PaisRequest): Observable<PaisResponse> {
    return this.http.post<PaisResponse>(this.apiUrl, payload).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, payload: PaisRequest): Observable<PaisResponse> {
    return this.http.put<PaisResponse>(`${this.apiUrl}/${id}`, payload).pipe(
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
    if (error?.error?.message) {
      errorMessage = error.error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}
