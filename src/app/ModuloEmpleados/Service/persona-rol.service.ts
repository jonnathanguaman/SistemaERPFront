import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { PersonaRolRequest, PersonaRolResponse } from '../Entidades/persona-rol.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio para gestión de asignación de roles a empleados
 * Conecta con el backend Spring Boot
 */
@Injectable({
  providedIn: 'root'
})
export class PersonaRolService {
  private readonly apiUrl = `${environment.apiUrl}/persona-roles`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private readonly http: HttpClient) { }

  /**
   * Obtener todas las asignaciones de roles
   * @returns Observable con array de asignaciones
   */
  findAll(): Observable<PersonaRolResponse[]> {
    return this.http.get<PersonaRolResponse[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Asignar un rol a un empleado
   * @param asignacion Datos de la asignación
   * @returns Observable con la asignación creada
   */
  assignRol(asignacion: PersonaRolRequest): Observable<PersonaRolResponse> {
    return this.http.post<PersonaRolResponse>(this.apiUrl, asignacion, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Eliminar una asignación de rol
   * @param id ID de la asignación
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
          errorMessage = 'Asignación no encontrada.';
          break;
        case 409:
          errorMessage = 'Este empleado ya tiene asignado este rol.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('Error en PersonaRolService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
