import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { CuentaPorCobrarRequest, CuentaPorCobrarResponse } from '../Entidad/cuenta-por-cobrar.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CuentaPorCobrarService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/cuentas-por-cobrar`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<CuentaPorCobrarResponse[]> {
    return this.http.get<CuentaPorCobrarResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<CuentaPorCobrarResponse> {
    return this.http.get<CuentaPorCobrarResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivas(): Observable<CuentaPorCobrarResponse[]> {
    return this.http.get<CuentaPorCobrarResponse[]>(`${this.apiUrl}/activas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByNumero(numeroCuenta: string): Observable<CuentaPorCobrarResponse> {
    return this.http.get<CuentaPorCobrarResponse>(`${this.apiUrl}/numero/${numeroCuenta}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByFactura(facturaId: number): Observable<CuentaPorCobrarResponse> {
    return this.http.get<CuentaPorCobrarResponse>(`${this.apiUrl}/factura/${facturaId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCliente(clienteId: number): Observable<CuentaPorCobrarResponse[]> {
    return this.http.get<CuentaPorCobrarResponse[]>(`${this.apiUrl}/cliente/${clienteId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByEstado(estado: string): Observable<CuentaPorCobrarResponse[]> {
    return this.http.get<CuentaPorCobrarResponse[]>(`${this.apiUrl}/estado/${estado}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findPendientes(): Observable<CuentaPorCobrarResponse[]> {
    return this.http.get<CuentaPorCobrarResponse[]>(`${this.apiUrl}/pendientes`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findVencidas(): Observable<CuentaPorCobrarResponse[]> {
    return this.http.get<CuentaPorCobrarResponse[]>(`${this.apiUrl}/vencidas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findConSaldoPendiente(clienteId: number): Observable<CuentaPorCobrarResponse[]> {
    return this.http.get<CuentaPorCobrarResponse[]>(`${this.apiUrl}/cliente/${clienteId}/con-saldo`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByRangoFechas(inicio: string, fin: string): Observable<CuentaPorCobrarResponse[]> {
    return this.http.get<CuentaPorCobrarResponse[]>(`${this.apiUrl}/fechas`, {
      params: { inicio, fin }
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(cuentaPorCobrar: CuentaPorCobrarRequest): Observable<CuentaPorCobrarResponse> {
    return this.http.post<CuentaPorCobrarResponse>(this.apiUrl, cuentaPorCobrar).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, cuentaPorCobrar: CuentaPorCobrarRequest): Observable<CuentaPorCobrarResponse> {
    return this.http.put<CuentaPorCobrarResponse>(`${this.apiUrl}/${id}`, cuentaPorCobrar).pipe(
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
      errorMessage = 'Cuenta por cobrar no encontrada';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 409) {
      errorMessage = 'La cuenta por cobrar ya existe';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
