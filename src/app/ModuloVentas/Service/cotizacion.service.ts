import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { CotizacionRequest, CotizacionResponse } from '../Entidad/cotizacion.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/cotizaciones`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<CotizacionResponse[]> {
    return this.http.get<CotizacionResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<CotizacionResponse> {
    return this.http.get<CotizacionResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivas(): Observable<CotizacionResponse[]> {
    return this.http.get<CotizacionResponse[]>(`${this.apiUrl}/activas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByNumero(numeroCotizacion: string): Observable<CotizacionResponse> {
    return this.http.get<CotizacionResponse>(`${this.apiUrl}/numero/${numeroCotizacion}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCliente(clienteId: number): Observable<CotizacionResponse[]> {
    return this.http.get<CotizacionResponse[]>(`${this.apiUrl}/cliente/${clienteId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByEstado(estado: string): Observable<CotizacionResponse[]> {
    return this.http.get<CotizacionResponse[]>(`${this.apiUrl}/estado/${estado}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByVendedor(vendedorId: number): Observable<CotizacionResponse[]> {
    return this.http.get<CotizacionResponse[]>(`${this.apiUrl}/vendedor/${vendedorId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByRangoFechas(inicio: string, fin: string): Observable<CotizacionResponse[]> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fin', fin);
    
    return this.http.get<CotizacionResponse[]>(`${this.apiUrl}/fechas`, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findBorrador(): Observable<CotizacionResponse[]> {
    return this.http.get<CotizacionResponse[]>(`${this.apiUrl}/borrador`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findEnviadas(): Observable<CotizacionResponse[]> {
    return this.http.get<CotizacionResponse[]>(`${this.apiUrl}/enviadas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findAprobadas(): Observable<CotizacionResponse[]> {
    return this.http.get<CotizacionResponse[]>(`${this.apiUrl}/aprobadas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findVencidas(): Observable<CotizacionResponse[]> {
    return this.http.get<CotizacionResponse[]>(`${this.apiUrl}/vencidas`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(cotizacion: CotizacionRequest): Observable<CotizacionResponse> {
    return this.http.post<CotizacionResponse>(this.apiUrl, cotizacion).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, cotizacion: CotizacionRequest): Observable<CotizacionResponse> {
    return this.http.put<CotizacionResponse>(`${this.apiUrl}/${id}`, cotizacion).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  enviar(id: number): Observable<CotizacionResponse> {
    return this.http.post<CotizacionResponse>(`${this.apiUrl}/${id}/enviar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  aprobar(id: number, usuarioId: number): Observable<CotizacionResponse> {
    return this.http.post<CotizacionResponse>(`${this.apiUrl}/${id}/aprobar?usuarioId=${usuarioId}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  rechazar(id: number): Observable<CotizacionResponse> {
    return this.http.post<CotizacionResponse>(`${this.apiUrl}/${id}/rechazar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  convertirAOrdenVenta(id: number, ordenVentaId: number): Observable<CotizacionResponse> {
    return this.http.post<CotizacionResponse>(`${this.apiUrl}/${id}/convertir?ordenVentaId=${ordenVentaId}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en la operación';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Tu sesión expiró. Inicia sesión nuevamente';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.status === 404) {
      errorMessage = 'Cotización no encontrada';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 409) {
      errorMessage = 'La cotización ya existe con ese número';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
