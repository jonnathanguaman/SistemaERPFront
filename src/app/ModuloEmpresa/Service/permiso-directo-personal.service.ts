import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PermisoDirectoPersonal } from '../Entidad/permiso-directo-personal.model';

@Injectable({
  providedIn: 'root'
})
export class PermisoDirectoPersonalService {
  private apiUrl = `${environment.apiUrl}/empresa/permisos-directos`.replace('/v1/private', '');

  constructor(private http: HttpClient) { }

  findAll(): Observable<PermisoDirectoPersonal[]> {
    return this.http.get<PermisoDirectoPersonal[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<PermisoDirectoPersonal> {
    return this.http.get<PermisoDirectoPersonal>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  findByPersonaEmpresaId(personaEmpresaId: number): Observable<PermisoDirectoPersonal[]> {
    return this.http.get<PermisoDirectoPersonal[]>(`${this.apiUrl}/persona-empresa/${personaEmpresaId}`).pipe(
      catchError(this.handleError)
    );
  }

  findByAccionProcesoId(accionProcesoId: number): Observable<PermisoDirectoPersonal[]> {
    return this.http.get<PermisoDirectoPersonal[]>(`${this.apiUrl}/accion-proceso/${accionProcesoId}`).pipe(
      catchError(this.handleError)
    );
  }

  save(permiso: PermisoDirectoPersonal): Observable<PermisoDirectoPersonal> {
    return this.http.post<PermisoDirectoPersonal>(this.apiUrl, permiso).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, permiso: PermisoDirectoPersonal): Observable<PermisoDirectoPersonal> {
    return this.http.put<PermisoDirectoPersonal>(`${this.apiUrl}/${id}`, permiso).pipe(
      catchError(this.handleError)
    );
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 404) {
      return throwError(() => new Error('Permiso directo no encontrado'));
    } else if (error.status === 409) {
      return throwError(() => new Error('Ya existe este permiso directo'));
    } else if (error.status === 500) {
      return throwError(() => new Error('Error interno del servidor'));
    }
    return throwError(() => new Error('Error al procesar la solicitud'));
  }
}
