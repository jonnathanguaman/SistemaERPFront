import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ListaIvaResponse } from '../Entidad/lista-iva.model';

@Injectable({
  providedIn: 'root'
})
export class ListaIvaService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/listas-iva`;

  constructor(private readonly http: HttpClient) {}

  findActivos(): Observable<ListaIvaResponse[]> {
    return this.http.get<ListaIvaResponse[]>(`${this.apiUrl}/activos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findVigentes(): Observable<ListaIvaResponse[]> {
    return this.http.get<ListaIvaResponse[]>(`${this.apiUrl}/vigentes`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findAll(): Observable<ListaIvaResponse[]> {
    return this.http.get<ListaIvaResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<ListaIvaResponse> {
    return this.http.get<ListaIvaResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(payload: any): Observable<ListaIvaResponse> {
    return this.http.post<ListaIvaResponse>(this.apiUrl, payload).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, payload: any): Observable<ListaIvaResponse> {
    return this.http.put<ListaIvaResponse>(`${this.apiUrl}/${id}`, payload).pipe(
      catchError(this.handleError)
    );
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
