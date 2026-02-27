import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { MetodoValuacionRequest, MetodoValuacionResponse } from '../Entidad/metodo-valuacion.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetodoValuacionService {
  private readonly apiUrl = `${environment.apiUrl}/metodo-valuacion`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<MetodoValuacionResponse[]> {
    return this.http.get<MetodoValuacionResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<MetodoValuacionResponse> {
    return this.http.get<MetodoValuacionResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(metodoValuacion: MetodoValuacionRequest): Observable<MetodoValuacionResponse> {
    return this.http.post<MetodoValuacionResponse>(this.apiUrl, metodoValuacion).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, metodoValuacion: MetodoValuacionRequest): Observable<MetodoValuacionResponse> {
    return this.http.put<MetodoValuacionResponse>(`${this.apiUrl}/${id}`, metodoValuacion).pipe(
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
      errorMessage = 'Método de valuación no encontrado';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
