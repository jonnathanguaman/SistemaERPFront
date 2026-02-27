import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { CentroCostosRequest, CentroCostosResponse } from '../Entidad/centro-costos.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CentroCostosService {
  private readonly apiUrl = `${environment.apiUrl}/centro-costos`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<CentroCostosResponse[]> {
    return this.http.get<CentroCostosResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<CentroCostosResponse> {
    return this.http.get<CentroCostosResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(centroCostos: CentroCostosRequest): Observable<CentroCostosResponse> {
    return this.http.post<CentroCostosResponse>(this.apiUrl, centroCostos).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, centroCostos: CentroCostosRequest): Observable<CentroCostosResponse> {
    return this.http.put<CentroCostosResponse>(`${this.apiUrl}/${id}`, centroCostos).pipe(
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
      errorMessage = 'Centro de costos no encontrado';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
