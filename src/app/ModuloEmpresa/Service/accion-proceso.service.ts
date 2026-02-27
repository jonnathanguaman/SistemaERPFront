import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AccionProceso } from '../Entidad/accion-proceso.model';

@Injectable({
  providedIn: 'root'
})
export class AccionProcesoService {
  private apiUrl = `${environment.apiUrl}/empresa/acciones-proceso`.replace('/v1/private', '');

  constructor(private http: HttpClient) { }

  findAll(): Observable<AccionProceso[]> {
    return this.http.get<AccionProceso[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<AccionProceso> {
    return this.http.get<AccionProceso>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  findByCodigo(codigo: string): Observable<AccionProceso> {
    return this.http.get<AccionProceso>(`${this.apiUrl}/codigo/${codigo}`).pipe(
      catchError(this.handleError)
    );
  }

  findByProcesoId(procesoId: number): Observable<AccionProceso[]> {
    return this.http.get<AccionProceso[]>(`${this.apiUrl}/proceso/${procesoId}`).pipe(
      catchError(this.handleError)
    );
  }

  save(accionProceso: AccionProceso): Observable<AccionProceso> {
    return this.http.post<AccionProceso>(this.apiUrl, accionProceso).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, accionProceso: AccionProceso): Observable<AccionProceso> {
    return this.http.put<AccionProceso>(`${this.apiUrl}/${id}`, accionProceso).pipe(
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
      return throwError(() => new Error('Acción de proceso no encontrada'));
    } else if (error.status === 409) {
      return throwError(() => new Error('Ya existe una acción con ese código'));
    } else if (error.status === 500) {
      return throwError(() => new Error('Error interno del servidor'));
    }
    return throwError(() => new Error('Error al procesar la solicitud'));
  }
}
