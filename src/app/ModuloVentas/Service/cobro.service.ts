import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { CobroRequest, CobroResponse } from '../Entidad/cobro.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CobroService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/cobros`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<CobroResponse[]> {
    return this.http.get<CobroResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<CobroResponse> {
    return this.http.get<CobroResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivos(): Observable<CobroResponse[]> {
    return this.http.get<CobroResponse[]>(`${this.apiUrl}/activos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByNumero(numeroCobro: string): Observable<CobroResponse> {
    return this.http.get<CobroResponse>(`${this.apiUrl}/numero/${numeroCobro}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCliente(clienteId: number): Observable<CobroResponse[]> {
    return this.http.get<CobroResponse[]>(`${this.apiUrl}/cliente/${clienteId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByEstado(estado: string): Observable<CobroResponse[]> {
    return this.http.get<CobroResponse[]>(`${this.apiUrl}/estado/${estado}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findPendientes(): Observable<CobroResponse[]> {
    return this.http.get<CobroResponse[]>(`${this.apiUrl}/estado/PENDIENTE`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findConfirmados(): Observable<CobroResponse[]> {
    return this.http.get<CobroResponse[]>(`${this.apiUrl}/estado/CONFIRMADO`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(cobro: CobroRequest): Observable<CobroResponse> {
    return this.http.post<CobroResponse>(this.apiUrl, cobro).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, cobro: CobroRequest): Observable<CobroResponse> {
    return this.http.put<CobroResponse>(`${this.apiUrl}/${id}`, cobro).pipe(
      catchError(this.handleError)
    );
  }

  confirmar(id: number): Observable<CobroResponse> {
    return this.http.patch<CobroResponse>(`${this.apiUrl}/${id}/confirmar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  anular(id: number, motivo: string): Observable<CobroResponse> {
    return this.http.patch<CobroResponse>(`${this.apiUrl}/${id}/anular`, { motivo }).pipe(
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
      errorMessage = 'Cobro no encontrado';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 409) {
      errorMessage = 'El cobro ya existe con ese número';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
