import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { DetalleRecepcionRequest, DetalleRecepcionResponse } from '../Entidades/recepcion-inventario.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio para gestión de detalles de recepción de inventario
 * Conecta con el backend Spring Boot
 */
@Injectable({
  providedIn: 'root'
})
export class DetalleRecepcionService {
  private readonly apiUrl = `${environment.apiUrl}/compras/recepciones`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtener todos los detalles de una recepción
   * @param recepcionId ID de la recepción
   * @returns Observable con array de detalles
   */
  findByRecepcion(recepcionId: number): Observable<DetalleRecepcionResponse[]> {
    const url = `${this.apiUrl}/${recepcionId}/detalles`;
    return this.http.get<DetalleRecepcionResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener un detalle específico por ID
   * @param detalleId ID del detalle
   * @returns Observable con los datos del detalle
   */
  findById(detalleId: number): Observable<DetalleRecepcionResponse> {
    const url = `${this.apiUrl}/detalles/${detalleId}`;
    return this.http.get<DetalleRecepcionResponse>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener detalles por producto
   * @param productoId ID del producto
   * @returns Observable con array de detalles
   */
  findByProducto(productoId: number): Observable<DetalleRecepcionResponse[]> {
    const url = `${this.apiUrl}/detalles/producto/${productoId}`;
    return this.http.get<DetalleRecepcionResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener detalles por lote
   * @param loteId ID del lote
   * @returns Observable con array de detalles
   */
  findByLote(loteId: number): Observable<DetalleRecepcionResponse[]> {
    const url = `${this.apiUrl}/detalles/lote/${loteId}`;
    return this.http.get<DetalleRecepcionResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Agregar un nuevo detalle a una recepción
   * @param recepcionId ID de la recepción
   * @param detalle Datos del detalle
   * @returns Observable con el detalle creado
   */
  create(recepcionId: number, detalle: DetalleRecepcionRequest): Observable<DetalleRecepcionResponse> {
    const url = `${this.apiUrl}/${recepcionId}/detalles`;
    return this.http.post<DetalleRecepcionResponse>(url, detalle, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar un detalle existente
   * @param detalleId ID del detalle
   * @param detalle Datos actualizados
   * @returns Observable con el detalle actualizado
   */
  update(detalleId: number, detalle: DetalleRecepcionRequest): Observable<DetalleRecepcionResponse> {
    const url = `${this.apiUrl}/detalles/${detalleId}`;
    return this.http.put<DetalleRecepcionResponse>(url, detalle, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar un detalle de recepción
   * @param detalleId ID del detalle
   * @returns Observable vacío
   */
  delete(detalleId: number): Observable<void> {
    const url = `${this.apiUrl}/detalles/${detalleId}`;
    return this.http.delete<void>(url)
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
    
    console.error('Error en DetalleRecepcionService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
