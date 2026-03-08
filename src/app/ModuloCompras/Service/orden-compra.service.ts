import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { OrdenCompraRequest, OrdenCompraResponse } from '../Entidades/orden-compra.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio para gestión de órdenes de compra
 * Conecta con el backend Spring Boot
 */
@Injectable({
  providedIn: 'root'
})
export class OrdenCompraService {
  private readonly apiUrl = `${environment.apiUrl}/compras/ordenes`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtener todas las órdenes de compra
   * @returns Observable con array de órdenes
   */
  findAll(): Observable<OrdenCompraResponse[]> {
    return this.http.get<OrdenCompraResponse[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener solo las órdenes activas
   * @returns Observable con array de órdenes activas
   */
  findActive(): Observable<OrdenCompraResponse[]> {
    const url = `${this.apiUrl}/activas`;
    return this.http.get<OrdenCompraResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener una orden de compra por ID
   * @param id ID de la orden
   * @returns Observable con los datos de la orden
   */
  findById(id: number): Observable<OrdenCompraResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<OrdenCompraResponse>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener orden por número
   * @param numeroOrden Número de la orden
   * @returns Observable con los datos de la orden
   */
  findByNumero(numeroOrden: string): Observable<OrdenCompraResponse> {
    const url = `${this.apiUrl}/numero/${numeroOrden}`;
    return this.http.get<OrdenCompraResponse>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener órdenes por proveedor
   * @param proveedorId ID del proveedor
   * @returns Observable con array de órdenes
   */
  findByProveedor(proveedorId: number): Observable<OrdenCompraResponse[]> {
    const url = `${this.apiUrl}/proveedor/${proveedorId}`;
    return this.http.get<OrdenCompraResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener órdenes por estado
   * @param estado Estado de la orden
   * @returns Observable con array de órdenes
   */
  findByEstado(estado: string): Observable<OrdenCompraResponse[]> {
    const url = `${this.apiUrl}/estado/${estado}`;
    return this.http.get<OrdenCompraResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Crear una nueva orden de compra
   * @param orden Datos de la orden a crear
   * @returns Observable con la orden creada
   */
  save(orden: OrdenCompraRequest): Observable<OrdenCompraResponse> {
    return this.http.post<OrdenCompraResponse>(this.apiUrl, orden, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar una orden de compra existente
   * @param id ID de la orden
   * @param orden Datos actualizados de la orden
   * @returns Observable con la orden actualizada
   */
  update(id: number, orden: OrdenCompraRequest): Observable<OrdenCompraResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<OrdenCompraResponse>(url, orden, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar (desactivar) una orden de compra
   * @param id ID de la orden a eliminar
   * @returns Observable void
   */
  delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Aprobar una orden de compra
   * @param id ID de la orden
   * @returns Observable con la orden aprobada
   */
  aprobar(id: number): Observable<OrdenCompraResponse> {
    const url = `${this.apiUrl}/${id}/aprobar`;
    return this.http.post<OrdenCompraResponse>(url, null, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Cancelar una orden de compra
   * @param id ID de la orden
   * @returns Observable con la orden cancelada
   */
  cancelar(id: number): Observable<OrdenCompraResponse> {
    const url = `${this.apiUrl}/${id}/cancelar`;
    return this.http.post<OrdenCompraResponse>(url, null, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores HTTP
   * @param error Error HTTP
   * @returns Observable con mensaje de error
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else if (error.status === 404) {
        errorMessage = 'Orden de compra no encontrada.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Datos inválidos en la solicitud.';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'Conflicto con los datos existentes.';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
      } else {
        errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('Error en OrdenCompraService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
