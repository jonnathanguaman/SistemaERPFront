import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RolProcesoPermiso } from '../Entidad/rol-proceso-permiso.model';

@Injectable({
  providedIn: 'root'
})
export class RolProcesoPermisoService {
  private apiUrl = `${environment.apiUrl}/empresa/roles-procesos-permisos`.replace('/v1/private', '');

  constructor(private http: HttpClient) { }

  findAll(): Observable<RolProcesoPermiso[]> {
    return this.http.get<RolProcesoPermiso[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<RolProcesoPermiso> {
    return this.http.get<RolProcesoPermiso>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  findByRolEmpresaId(rolEmpresaId: number): Observable<RolProcesoPermiso[]> {
    return this.http.get<RolProcesoPermiso[]>(`${this.apiUrl}/rol-empresa/${rolEmpresaId}`).pipe(
      catchError(this.handleError)
    );
  }

  findByAccionProcesoId(accionProcesoId: number): Observable<RolProcesoPermiso[]> {
    return this.http.get<RolProcesoPermiso[]>(`${this.apiUrl}/accion-proceso/${accionProcesoId}`).pipe(
      catchError(this.handleError)
    );
  }

  save(rolProcesoPermiso: RolProcesoPermiso): Observable<RolProcesoPermiso> {
    return this.http.post<RolProcesoPermiso>(this.apiUrl, rolProcesoPermiso).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, rolProcesoPermiso: RolProcesoPermiso): Observable<RolProcesoPermiso> {
    return this.http.put<RolProcesoPermiso>(`${this.apiUrl}/${id}`, rolProcesoPermiso).pipe(
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
      return throwError(() => new Error('Permiso de rol-proceso no encontrado'));
    } else if (error.status === 409) {
      return throwError(() => new Error('Ya existe este permiso para el rol'));
    } else if (error.status === 500) {
      return throwError(() => new Error('Error interno del servidor'));
    }
    return throwError(() => new Error('Error al procesar la solicitud'));
  }
}
