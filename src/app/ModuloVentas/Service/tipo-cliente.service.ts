import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { TipoClienteRequest, TipoClienteResponse } from '../Entidad/tipo-cliente.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoClienteService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/tipos-cliente`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<TipoClienteResponse[]> {
    return this.http.get<TipoClienteResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<TipoClienteResponse> {
    return this.http.get<TipoClienteResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivos(): Observable<TipoClienteResponse[]> {
    return this.http.get<TipoClienteResponse[]>(`${this.apiUrl}/activos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCodigo(codigo: string): Observable<TipoClienteResponse> {
    return this.http.get<TipoClienteResponse>(`${this.apiUrl}/codigo/${codigo}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(tipoCliente: TipoClienteRequest): Observable<TipoClienteResponse> {
    return this.http.post<TipoClienteResponse>(this.apiUrl, tipoCliente).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  update(id: number, tipoCliente: TipoClienteRequest): Observable<TipoClienteResponse> {
    return this.http.put<TipoClienteResponse>(`${this.apiUrl}/${id}`, tipoCliente).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
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
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
