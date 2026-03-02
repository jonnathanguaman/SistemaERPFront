import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { DetalleCobroRequest, DetalleCobroResponse } from '../Entidad/detalle-cobro.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetalleCobroService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/detalles-cobro`;

  constructor(private readonly http: HttpClient) {}

  obtenerTodos(): Observable<DetalleCobroResponse[]> {
    return this.http.get<DetalleCobroResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  crear(detalleCobro: DetalleCobroRequest): Observable<DetalleCobroResponse> {
    return this.http.post<DetalleCobroResponse>(this.apiUrl, detalleCobro).pipe(
      catchError(this.handleError)
    );
  }

  actualizar(id: number, detalleCobro: DetalleCobroRequest): Observable<DetalleCobroResponse> {
    return this.http.put<DetalleCobroResponse>(`${this.apiUrl}/${id}`, detalleCobro).pipe(
      catchError(this.handleError)
    );
  }

  obtenerPorId(id: number): Observable<DetalleCobroResponse> {
    return this.http.get<DetalleCobroResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorCobro(cobroId: number): Observable<DetalleCobroResponse[]> {
    return this.http.get<DetalleCobroResponse[]>(`${this.apiUrl}/cobro/${cobroId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorCuentaPorCobrar(cuentaId: number): Observable<DetalleCobroResponse[]> {
    return this.http.get<DetalleCobroResponse[]>(`${this.apiUrl}/cuenta-por-cobrar/${cuentaId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorFactura(facturaId: number): Observable<DetalleCobroResponse[]> {
    return this.http.get<DetalleCobroResponse[]>(`${this.apiUrl}/factura/${facturaId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerMontoAplicadoPorCuenta(cuentaId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/cuenta-por-cobrar/${cuentaId}/monto-aplicado`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerMontoAplicadoPorCobro(cobroId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/cobro/${cobroId}/monto-aplicado`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  contarPorCobro(cobroId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/cobro/${cobroId}/contar`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  eliminarPorCobro(cobroId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cobro/${cobroId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en la operación';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Solicitud inválida';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Error en DetalleCobroService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
