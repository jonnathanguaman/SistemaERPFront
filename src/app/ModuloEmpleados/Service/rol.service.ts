import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { RolAccesoRequest, RolAccesoResponse } from '../Entidades/rol.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio para gestión de roles de acceso
 * Conecta con el backend Spring Boot
 */
@Injectable({
  providedIn: 'root'
})
export class RolAccesoService {
  private readonly apiUrl = `${environment.apiUrl}/roles-acceso`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtener todos los roles
   * @returns Observable con array de roles
   */
  findAll(): Observable<RolAccesoResponse[]> {
    return this.http.get<RolAccesoResponse[]>(this.apiUrl)
      .pipe(
        retry(2), // Reintentar 2 veces en caso de error
        catchError(this.handleError)
      );
  }

  /**
   * Obtener un rol por ID
   * @param id ID del rol
   * @returns Observable con los datos del rol
   */
  findById(id: number): Observable<RolAccesoResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<RolAccesoResponse>(url)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Crear un nuevo rol
   * @param rol Datos del rol a crear
   * @returns Observable con el rol creado
   */
  save(rol: RolAccesoRequest): Observable<RolAccesoResponse> {
    return this.http.post<RolAccesoResponse>(this.apiUrl, rol, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Actualizar un rol existente
   * @param id ID del rol
   * @param rol Datos actualizados del rol
   * @returns Observable con el rol actualizado
   */
  update(id: number, rol: RolAccesoRequest): Observable<RolAccesoResponse> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<RolAccesoResponse>(url, rol, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar un rol
   * @param id ID del rol a eliminar
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
   * Manejo centralizado de errores HTTP
   * @param error Error HTTP capturado
   * @returns Observable con el error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
          break;
        case 400:
          errorMessage = 'Solicitud incorrecta. Verifica los datos enviados.';
          break;
        case 404:
          errorMessage = 'Rol no encontrado.';
          break;
        case 409:
          errorMessage = 'Ya existe un rol con ese nombre.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('Error en RolAccesoService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
