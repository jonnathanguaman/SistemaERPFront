import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { CondicionPagoRequest, CondicionPagoResponse } from '../Entidad/condicion-pago.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CondicionPagoService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/condiciones-pago`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<CondicionPagoResponse[]> {
    return this.http.get<CondicionPagoResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<CondicionPagoResponse> {
    return this.http.get<CondicionPagoResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivas(): Observable<CondicionPagoResponse[]> {
    return this.http.get<CondicionPagoResponse[]>(`${this.apiUrl}/activas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCodigo(codigo: string): Observable<CondicionPagoResponse> {
    return this.http.get<CondicionPagoResponse>(`${this.apiUrl}/codigo/${codigo}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findPredeterminada(): Observable<CondicionPagoResponse> {
    return this.http.get<CondicionPagoResponse>(`${this.apiUrl}/predeterminada`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findCredito(): Observable<CondicionPagoResponse[]> {
    return this.http.get<CondicionPagoResponse[]>(`${this.apiUrl}/credito`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findContado(): Observable<CondicionPagoResponse[]> {
    return this.http.get<CondicionPagoResponse[]>(`${this.apiUrl}/contado`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(condicionPago: CondicionPagoRequest): Observable<CondicionPagoResponse> {
    return this.http.post<CondicionPagoResponse>(this.apiUrl, condicionPago).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, condicionPago: CondicionPagoRequest): Observable<CondicionPagoResponse> {
    return this.http.put<CondicionPagoResponse>(`${this.apiUrl}/${id}`, condicionPago).pipe(
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
      errorMessage = 'Condición de pago no encontrada';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 409) {
      errorMessage = 'La condición de pago ya existe con ese código';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
