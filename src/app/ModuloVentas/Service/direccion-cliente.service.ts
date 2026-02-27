import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { DireccionClienteRequest, DireccionClienteResponse } from '../Entidad/direccion-cliente.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DireccionClienteService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/direcciones-cliente`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<DireccionClienteResponse[]> {
    return this.http.get<DireccionClienteResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<DireccionClienteResponse> {
    return this.http.get<DireccionClienteResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCliente(clienteId: number): Observable<DireccionClienteResponse[]> {
    return this.http.get<DireccionClienteResponse[]>(`${this.apiUrl}/cliente/${clienteId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivasByCliente(clienteId: number): Observable<DireccionClienteResponse[]> {
    return this.http.get<DireccionClienteResponse[]>(`${this.apiUrl}/cliente/${clienteId}/activas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findPrincipalByCliente(clienteId: number): Observable<DireccionClienteResponse> {
    return this.http.get<DireccionClienteResponse>(`${this.apiUrl}/cliente/${clienteId}/principal`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(direccion: DireccionClienteRequest): Observable<DireccionClienteResponse> {
    return this.http.post<DireccionClienteResponse>(this.apiUrl, direccion).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, direccion: DireccionClienteRequest): Observable<DireccionClienteResponse> {
    return this.http.put<DireccionClienteResponse>(`${this.apiUrl}/${id}`, direccion).pipe(
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
      errorMessage = 'Dirección no encontrada';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
