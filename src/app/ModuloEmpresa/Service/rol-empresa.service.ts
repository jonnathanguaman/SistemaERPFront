import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RolEmpresa } from '../Entidad/rol-empresa.model';

@Injectable({
  providedIn: 'root'
})
export class RolEmpresaService {
  private apiUrl = `${environment.apiUrl}/empresa/roles`.replace('/v1/private', '');

  constructor(private http: HttpClient) { }

  findAll(): Observable<RolEmpresa[]> {
    return this.http.get<RolEmpresa[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<RolEmpresa> {
    return this.http.get<RolEmpresa>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  findByEmpresaId(empresaId: number): Observable<RolEmpresa[]> {
    return this.http.get<RolEmpresa[]>(`${this.apiUrl}/empresa/${empresaId}`).pipe(
      catchError(this.handleError)
    );
  }

  save(rolEmpresa: RolEmpresa): Observable<RolEmpresa> {
    return this.http.post<RolEmpresa>(this.apiUrl, rolEmpresa).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, rolEmpresa: RolEmpresa): Observable<RolEmpresa> {
    return this.http.put<RolEmpresa>(`${this.apiUrl}/${id}`, rolEmpresa).pipe(
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
      return throwError(() => new Error('Rol de empresa no encontrado'));
    } else if (error.status === 409) {
      return throwError(() => new Error('Ya existe un rol con ese nombre en la empresa'));
    } else if (error.status === 500) {
      return throwError(() => new Error('Error interno del servidor'));
    }
    return throwError(() => new Error('Error al procesar la solicitud'));
  }
}
