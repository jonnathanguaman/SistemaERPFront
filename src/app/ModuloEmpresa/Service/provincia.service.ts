import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProvinciaRequest, ProvinciaResponse } from '../Entidad/provincia.model';

@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {
  private readonly apiUrl = `${environment.apiUrl}/empresa/provincias`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ProvinciaResponse[]> {
    return this.http.get<ProvinciaResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivas(): Observable<ProvinciaResponse[]> {
    return this.http.get<ProvinciaResponse[]>(`${this.apiUrl}/activas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByPais(paisId: number): Observable<ProvinciaResponse[]> {
    return this.http.get<ProvinciaResponse[]>(`${this.apiUrl}/pais/${paisId}/activas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(payload: ProvinciaRequest): Observable<ProvinciaResponse> {
    return this.http.post<ProvinciaResponse>(this.apiUrl, payload).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, payload: ProvinciaRequest): Observable<ProvinciaResponse> {
    return this.http.put<ProvinciaResponse>(`${this.apiUrl}/${id}`, payload).pipe(
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
