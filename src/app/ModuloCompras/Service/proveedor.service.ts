import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ProveedorRequest, ProveedorResponse } from '../Entidades/proveedor.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio para gestión de proveedores
 * Conecta con el backend Spring Boot
 */
@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private readonly apiUrl = `${environment.apiUrl}/compras/proveedores`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtener todos los proveedores
   * @returns Observable con array de proveedores
   */
  findAll(): Observable<ProveedorResponse[]> {
    return this.http.get<ProveedorResponse[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener solo los proveedores activos
   * @returns Observable con array de proveedores activos
   */
  findActive(): Observable<ProveedorResponse[]> {
    const url = `${this.apiUrl}/activos`;
    return this.http.get<ProveedorResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Buscar proveedor por número de identificación
   * @param numeroIdentificacion RUC, cédula o pasaporte
   * @returns Observable con el proveedor encontrado
   */
  findByIdentificacion(numeroIdentificacion: string): Observable<ProveedorResponse> {
    const url = `${this.apiUrl}/identificacion/${numeroIdentificacion}`;
    return this.http.get<ProveedorResponse>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Buscar proveedores por razón social
   * @param razonSocial Texto a buscar en razón social
   * @returns Observable con array de proveedores encontrados
   */
  findByRazonSocial(razonSocial: string): Observable<ProveedorResponse[]> {
    const url = `${this.apiUrl}/buscar?razonSocial=${encodeURIComponent(razonSocial)}`;
    return this.http.get<ProveedorResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Filtrar proveedores por tipo
   * @param tipoProveedor Tipo de proveedor
   * @returns Observable con array de proveedores filtrados
   */
  findByTipo(tipoProveedor: string): Observable<ProveedorResponse[]> {
    const url = `${this.apiUrl}/tipo/${tipoProveedor}`;
    return this.http.get<ProveedorResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Filtrar proveedores por estado
   * @param estado Estado del proveedor (ACTIVO, INACTIVO, BLOQUEADO)
   * @returns Observable con array de proveedores filtrados
   */
  findByEstado(estado: string): Observable<ProveedorResponse[]> {
    const url = `${this.apiUrl}/estado/${estado}`;
    return this.http.get<ProveedorResponse[]>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Obtener un proveedor por ID
   * @param id ID del proveedor
   * @returns Observable con los datos del proveedor
   */
  findById(id: number): Observable<ProveedorResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<ProveedorResponse>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Crear un nuevo proveedor
   * @param proveedor Datos del proveedor a crear
   * @returns Observable con el proveedor creado
   */
  save(proveedor: ProveedorRequest): Observable<ProveedorResponse> {
    return this.http.post<ProveedorResponse>(this.apiUrl, proveedor, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar un proveedor existente
   * @param id ID del proveedor
   * @param proveedor Datos actualizados del proveedor
   * @returns Observable con el proveedor actualizado
   */
  update(id: number, proveedor: ProveedorRequest): Observable<ProveedorResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ProveedorResponse>(url, proveedor, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar (desactivar) un proveedor
   * @param id ID del proveedor a eliminar
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
   * Activar un proveedor
   * @param id ID del proveedor a activar
   * @returns Observable void
   */
  activar(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}/activar`;
    return this.http.patch<void>(url, null)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Cambiar el estado del proveedor
   * @param id ID del proveedor
   * @param estado Nuevo estado (ACTIVO, INACTIVO, BLOQUEADO)
   * @returns Observable con el proveedor actualizado
   */
  cambiarEstado(id: number, estado: string): Observable<ProveedorResponse> {
    const url = `${this.apiUrl}/${id}/estado?estado=${estado}`;
    return this.http.patch<ProveedorResponse>(url, null)
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
        errorMessage = 'Proveedor no encontrado.';
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Datos inválidos en la solicitud.';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'Ya existe un proveedor con ese RUC.';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
      } else {
        errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('Error en ProveedorService:', error);
    return throwError(() => new Error(errorMessage));
  }
}

