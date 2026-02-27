import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { UnidadOrganizacional } from '../Entidad/unidad-organizacional.model';

@Injectable({
  providedIn: 'root'
})
export class UnidadOrganizacionalService {
  private apiUrl = `${environment.apiUrl}/unidad-organizacional`;

  constructor(private http: HttpClient) { }

  findAll(): Observable<UnidadOrganizacional[]> {
    return this.http.get<UnidadOrganizacional[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<UnidadOrganizacional> {
    return this.http.get<UnidadOrganizacional>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }



  save(unidadOrganizacional: UnidadOrganizacional): Observable<UnidadOrganizacional> {
    return this.http.post<UnidadOrganizacional>(this.apiUrl, unidadOrganizacional).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, unidadOrganizacional: UnidadOrganizacional): Observable<UnidadOrganizacional> {
    return this.http.put<UnidadOrganizacional>(`${this.apiUrl}/${id}`, unidadOrganizacional).pipe(
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
      return throwError(() => new Error('Unidad organizacional no encontrada'));
    } else if (error.status === 409) {
      return throwError(() => new Error('Ya existe una unidad organizacional con este código'));
    } else if (error.status === 500) {
      return throwError(() => new Error('Error interno del servidor'));
    }
    return throwError(() => new Error('Error al procesar la solicitud'));
  }
}
