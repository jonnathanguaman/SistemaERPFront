import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CiudadRequest, CiudadResponse } from '../Entidad/ciudad.model';

@Injectable({
  providedIn: 'root'
})
export class CiudadService {
  private readonly apiUrl = `${environment.apiUrl}/empresa/ciudades`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<CiudadResponse[]> {
    return this.http.get<CiudadResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivas(): Observable<CiudadResponse[]> {
    return this.http.get<CiudadResponse[]>(`${this.apiUrl}/activas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByProvincia(provinciaId: number): Observable<CiudadResponse[]> {
    return this.http.get<CiudadResponse[]>(`${this.apiUrl}/provincia/${provinciaId}/activas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(payload: CiudadRequest): Observable<CiudadResponse> {
    return this.http.post<CiudadResponse>(this.apiUrl, payload).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, payload: CiudadRequest): Observable<CiudadResponse> {
    return this.http.put<CiudadResponse>(`${this.apiUrl}/${id}`, payload).pipe(
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
