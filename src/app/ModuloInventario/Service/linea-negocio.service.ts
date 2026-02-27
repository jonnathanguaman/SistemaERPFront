import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { LineaNegocioRequest, LineaNegocioResponse } from '../Entidad/linea-negocio.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LineaNegocioService {
  private readonly apiUrl = `${environment.apiUrl}/linea-negocio`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<LineaNegocioResponse[]> {
    return this.http.get<LineaNegocioResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<LineaNegocioResponse> {
    return this.http.get<LineaNegocioResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(lineaNegocio: LineaNegocioRequest): Observable<LineaNegocioResponse> {
    return this.http.post<LineaNegocioResponse>(this.apiUrl, lineaNegocio).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, lineaNegocio: LineaNegocioRequest): Observable<LineaNegocioResponse> {
    return this.http.put<LineaNegocioResponse>(`${this.apiUrl}/${id}`, lineaNegocio).pipe(
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en la operación';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status === 404) {
      errorMessage = 'Línea de negocio no encontrada';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
