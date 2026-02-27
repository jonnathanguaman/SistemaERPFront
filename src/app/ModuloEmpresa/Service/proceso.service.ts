import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Proceso } from '../Entidad/proceso.model';

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {
  private apiUrl = `${environment.apiUrl}/empresa/procesos`.replace('/v1/private', '');

  constructor(private http: HttpClient) { }

  findAll(): Observable<Proceso[]> {
    return this.http.get<Proceso[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<Proceso> {
    return this.http.get<Proceso>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  findByCodigo(codigo: string): Observable<Proceso> {
    return this.http.get<Proceso>(`${this.apiUrl}/codigo/${codigo}`).pipe(
      catchError(this.handleError)
    );
  }

  findByNombre(nombre: string): Observable<Proceso[]> {
    return this.http.get<Proceso[]>(`${this.apiUrl}/buscar?nombre=${nombre}`).pipe(
      catchError(this.handleError)
    );
  }

  save(proceso: Proceso): Observable<Proceso> {
    return this.http.post<Proceso>(this.apiUrl, proceso).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, proceso: Proceso): Observable<Proceso> {
    return this.http.put<Proceso>(`${this.apiUrl}/${id}`, proceso).pipe(
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
      return throwError(() => new Error('Proceso no encontrado'));
    } else if (error.status === 409) {
      return throwError(() => new Error('Ya existe un proceso con ese código'));
    } else if (error.status === 500) {
      return throwError(() => new Error('Error interno del servidor'));
    }
    return throwError(() => new Error('Error al procesar la solicitud'));
  }
}
