import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { OrdenVentaRequest, OrdenVentaResponse } from '../Entidad/orden-venta.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdenVentaService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/ordenes-venta`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<OrdenVentaResponse[]> {
    return this.http.get<OrdenVentaResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<OrdenVentaResponse> {
    return this.http.get<OrdenVentaResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivos(): Observable<OrdenVentaResponse[]> {
    return this.http.get<OrdenVentaResponse[]>(`${this.apiUrl}/activos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByNumero(numeroOrden: string): Observable<OrdenVentaResponse> {
    return this.http.get<OrdenVentaResponse>(`${this.apiUrl}/numero/${numeroOrden}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCliente(clienteId: number): Observable<OrdenVentaResponse[]> {
    return this.http.get<OrdenVentaResponse[]>(`${this.apiUrl}/cliente/${clienteId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByEstado(estado: string): Observable<OrdenVentaResponse[]> {
    return this.http.get<OrdenVentaResponse[]>(`${this.apiUrl}/estado/${estado}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByVendedor(vendedorId: number): Observable<OrdenVentaResponse[]> {
    return this.http.get<OrdenVentaResponse[]>(`${this.apiUrl}/vendedor/${vendedorId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByBodega(bodegaId: number): Observable<OrdenVentaResponse[]> {
    return this.http.get<OrdenVentaResponse[]>(`${this.apiUrl}/bodega/${bodegaId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCotizacion(cotizacionId: number): Observable<OrdenVentaResponse[]> {
    return this.http.get<OrdenVentaResponse[]>(`${this.apiUrl}/cotizacion/${cotizacionId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(ordenVenta: OrdenVentaRequest): Observable<OrdenVentaResponse> {
    return this.http.post<OrdenVentaResponse>(this.apiUrl, ordenVenta).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, ordenVenta: OrdenVentaRequest): Observable<OrdenVentaResponse> {
    return this.http.put<OrdenVentaResponse>(`${this.apiUrl}/${id}`, ordenVenta).pipe(
      catchError(this.handleError)
    );
  }

  confirmar(id: number, usuarioAprobacionId: number): Observable<OrdenVentaResponse> {
    return this.http.patch<OrdenVentaResponse>(
      `${this.apiUrl}/${id}/confirmar`,
      null,
      { params: { usuarioAprobacionId: usuarioAprobacionId.toString() } }
    ).pipe(
      catchError(this.handleError)
    );
  }

  iniciarPreparacion(id: number): Observable<OrdenVentaResponse> {
    return this.http.patch<OrdenVentaResponse>(`${this.apiUrl}/${id}/iniciar-preparacion`, null).pipe(
      catchError(this.handleError)
    );
  }

  marcarComoLista(id: number): Observable<OrdenVentaResponse> {
    return this.http.patch<OrdenVentaResponse>(`${this.apiUrl}/${id}/marcar-lista`, null).pipe(
      catchError(this.handleError)
    );
  }

  entregar(id: number): Observable<OrdenVentaResponse> {
    return this.http.patch<OrdenVentaResponse>(`${this.apiUrl}/${id}/entregar`, null).pipe(
      catchError(this.handleError)
    );
  }

  cancelar(id: number): Observable<OrdenVentaResponse> {
    return this.http.patch<OrdenVentaResponse>(`${this.apiUrl}/${id}/cancelar`, null).pipe(
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
      errorMessage = 'Orden de venta no encontrada';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 409) {
      errorMessage = 'Ya existe una orden de venta con ese número';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
