import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { PersonaEmpresaRol } from '../Entidad/persona-empresa-rol.model';

@Injectable({
  providedIn: 'root'
})
export class PersonaEmpresaRolService {
  private apiUrl = `${environment.apiUrl}/empresa/personas-empresa-roles`.replace('/v1/private', '');

  constructor(private http: HttpClient) { }

  findAll(): Observable<PersonaEmpresaRol[]> {
    return this.http.get<PersonaEmpresaRol[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<PersonaEmpresaRol> {
    return this.http.get<PersonaEmpresaRol>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  findByPersonaEmpresaId(personaEmpresaId: number): Observable<PersonaEmpresaRol[]> {
    return this.http.get<PersonaEmpresaRol[]>(`${this.apiUrl}/persona-empresa/${personaEmpresaId}`).pipe(
      catchError(this.handleError)
    );
  }

  findByRolEmpresaId(rolEmpresaId: number): Observable<PersonaEmpresaRol[]> {
    return this.http.get<PersonaEmpresaRol[]>(`${this.apiUrl}/rol/${rolEmpresaId}`).pipe(
      catchError(this.handleError)
    );
  }

  findActivos(): Observable<PersonaEmpresaRol[]> {
    return this.http.get<PersonaEmpresaRol[]>(`${this.apiUrl}/activos`).pipe(
      catchError(this.handleError)
    );
  }

  save(personaEmpresaRol: PersonaEmpresaRol): Observable<PersonaEmpresaRol> {
    return this.http.post<PersonaEmpresaRol>(this.apiUrl, personaEmpresaRol).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, personaEmpresaRol: PersonaEmpresaRol): Observable<PersonaEmpresaRol> {
    return this.http.put<PersonaEmpresaRol>(`${this.apiUrl}/${id}`, personaEmpresaRol).pipe(
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
      return throwError(() => new Error('Relación persona-empresa-rol no encontrada'));
    } else if (error.status === 409) {
      return throwError(() => new Error('Ya existe esta asignación de rol'));
    } else if (error.status === 500) {
      return throwError(() => new Error('Error interno del servidor'));
    }
    return throwError(() => new Error('Error al procesar la solicitud'));
  }
}
