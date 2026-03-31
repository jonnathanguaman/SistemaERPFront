import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { RecepcionInventarioRequest, RecepcionInventarioResponse } from '../Entidades/recepcion-inventario.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio para gestión de recepciones de inventario
 * Conecta con el backend Spring Boot
 */
@Injectable({
  providedIn: 'root'
})
export class RecepcionInventarioService {
  private readonly apiUrl = `${environment.apiUrl}/compras/recepciones`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtener todas las recepciones de inventario
   * @returns Observable con array de recepciones
   */
  findAll(): Observable<RecepcionInventarioResponse[]> {
    return this.http.get<RecepcionInventarioResponse[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener solo las recepciones activas
   * @returns Observable con array de recepciones activas
   */
  findActive(): Observable<RecepcionInventarioResponse[]> {
    const url = `${this.apiUrl}/activas`;
    return this.http.get<RecepcionInventarioResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener una recepción por ID
   * @param id ID de la recepción
   * @returns Observable con los datos de la recepción
   */
  findById(id: number): Observable<RecepcionInventarioResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<RecepcionInventarioResponse>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener recepción por número
   * @param numeroRecepcion Número de la recepción
   * @returns Observable con los datos de la recepción
   */
  findByNumero(numeroRecepcion: string): Observable<RecepcionInventarioResponse> {
    const url = `${this.apiUrl}/numero/${numeroRecepcion}`;
    return this.http.get<RecepcionInventarioResponse>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener recepciones por orden de compra
   * @param ordenCompraId ID de la orden de compra
   * @returns Observable con array de recepciones
   */
  findByOrdenCompra(ordenCompraId: number): Observable<RecepcionInventarioResponse[]> {
    const url = `${this.apiUrl}/orden-compra/${ordenCompraId}`;
    return this.http.get<RecepcionInventarioResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener recepciones por proveedor
   * @param proveedorId ID del proveedor
   * @returns Observable con array de recepciones
   */
  findByProveedor(proveedorId: number): Observable<RecepcionInventarioResponse[]> {
    const url = `${this.apiUrl}/proveedor/${proveedorId}`;
    return this.http.get<RecepcionInventarioResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener recepciones por estado
   * @param estado Estado de la recepción
   * @returns Observable con array de recepciones
   */
  findByEstado(estado: string): Observable<RecepcionInventarioResponse[]> {
    const url = `${this.apiUrl}/estado/${estado}`;
    return this.http.get<RecepcionInventarioResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener recepciones por bodega
   * @param bodegaId ID de la bodega
   * @returns Observable con array de recepciones
   */
  findByBodega(bodegaId: number): Observable<RecepcionInventarioResponse[]> {
    const url = `${this.apiUrl}/bodega/${bodegaId}`;
    return this.http.get<RecepcionInventarioResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener recepciones por rango de fechas
   * @param fechaInicio Fecha inicial
   * @param fechaFin Fecha final
   * @returns Observable con array de recepciones
   */
  findByFechas(fechaInicio: string, fechaFin: string): Observable<RecepcionInventarioResponse[]> {
    const url = `${this.apiUrl}/fechas?inicio=${fechaInicio}&fin=${fechaFin}`;
    return this.http.get<RecepcionInventarioResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Crear una nueva recepción de inventario
   * @param recepcion Datos de la recepción
   * @returns Observable con la recepción creada
   */
  create(recepcion: RecepcionInventarioRequest): Observable<RecepcionInventarioResponse> {
    return this.http.post<RecepcionInventarioResponse>(this.apiUrl, recepcion, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar una recepción existente
   * @param id ID de la recepción
   * @param recepcion Datos actualizados
   * @returns Observable con la recepción actualizada
   */
  update(id: number, recepcion: RecepcionInventarioRequest): Observable<RecepcionInventarioResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<RecepcionInventarioResponse>(url, recepcion, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Confirmar una recepción (cambia estado a CONFIRMADA y genera movimiento de inventario)
   * @param id ID de la recepción
   * @returns Observable con la recepción confirmada
   */
  confirmar(id: number, usuarioId: number): Observable<RecepcionInventarioResponse> {
    const url = `${this.apiUrl}/${id}/confirmar?usuarioId=${usuarioId}`;
    return this.http.post<RecepcionInventarioResponse>(url, {}, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Cancelar una recepción
   * @param id ID de la recepción
   * @param motivo Motivo de cancelación
   * @returns Observable con la recepción cancelada
   */
  cancelar(id: number, motivo: string): Observable<RecepcionInventarioResponse> {
    const url = `${this.apiUrl}/${id}/cancelar`;
    return this.http.post<RecepcionInventarioResponse>(url, { motivo }, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar (desactivar) una recepción
   * @param id ID de la recepción
   * @returns Observable vacío
   */
  delete(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Reactivar una recepción desactivada
   * @param id ID de la recepción
   * @returns Observable con la recepción reactivada
   */
  reactivar(id: number): Observable<RecepcionInventarioResponse> {
    const url = `${this.apiUrl}/${id}/reactivar`;
    return this.http.patch<RecepcionInventarioResponse>(url, {}, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores HTTP
   * @param error Error HTTP
   * @returns Observable con el error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
      
      // Si el backend retorna un mensaje específico
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error('Error en RecepcionInventarioService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
