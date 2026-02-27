import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ReporteJerarquico } from '../Entidad/reporte-jerarquico.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteJerarquicoService {
  private apiUrl = `${environment.apiUrl}/empresa/reportes-jerarquicos`.replace('/v1/private', '');

  constructor(private http: HttpClient) { }

  findAll(): Observable<ReporteJerarquico[]> {
    return this.http.get<ReporteJerarquico[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<ReporteJerarquico> {
    return this.http.get<ReporteJerarquico>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  findBySubordinadoId(subordinadoId: number): Observable<ReporteJerarquico[]> {
    return this.http.get<ReporteJerarquico[]>(`${this.apiUrl}/subordinado/${subordinadoId}`).pipe(
      catchError(this.handleError)
    );
  }

  findByJefeId(jefeId: number): Observable<ReporteJerarquico[]> {
    return this.http.get<ReporteJerarquico[]>(`${this.apiUrl}/jefe/${jefeId}`).pipe(
      catchError(this.handleError)
    );
  }

  findActivos(): Observable<ReporteJerarquico[]> {
    return this.http.get<ReporteJerarquico[]>(`${this.apiUrl}/activos`).pipe(
      catchError(this.handleError)
    );
  }

  save(reporteJerarquico: ReporteJerarquico): Observable<ReporteJerarquico> {
    return this.http.post<ReporteJerarquico>(this.apiUrl, reporteJerarquico).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, reporteJerarquico: ReporteJerarquico): Observable<ReporteJerarquico> {
    return this.http.put<ReporteJerarquico>(`${this.apiUrl}/${id}`, reporteJerarquico).pipe(
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
      return throwError(() => new Error('Reporte jerárquico no encontrado'));
    } else if (error.status === 409) {
      return throwError(() => new Error('Ya existe este reporte jerárquico'));
    } else if (error.status === 500) {
      return throwError(() => new Error('Error interno del servidor'));
    }
    return throwError(() => new Error('Error al procesar la solicitud'));
  }
}
