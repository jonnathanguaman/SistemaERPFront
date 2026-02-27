import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { ListaPreciosRequest, ListaPreciosResponse } from '../Entidad/lista-precios.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ListaPreciosService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/listas-precios`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ListaPreciosResponse[]> {
    return this.http.get<ListaPreciosResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<ListaPreciosResponse> {
    return this.http.get<ListaPreciosResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivos(): Observable<ListaPreciosResponse[]> {
    return this.http.get<ListaPreciosResponse[]>(`${this.apiUrl}/activos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findVigentes(): Observable<ListaPreciosResponse[]> {
    return this.http.get<ListaPreciosResponse[]>(`${this.apiUrl}/vigentes`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCodigo(codigo: string): Observable<ListaPreciosResponse> {
    return this.http.get<ListaPreciosResponse>(`${this.apiUrl}/codigo/${codigo}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByTipo(tipoLista: string): Observable<ListaPreciosResponse[]> {
    return this.http.get<ListaPreciosResponse[]>(`${this.apiUrl}/tipo/${tipoLista}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findVigentesByTipo(tipoLista: string): Observable<ListaPreciosResponse[]> {
    return this.http.get<ListaPreciosResponse[]>(`${this.apiUrl}/tipo/${tipoLista}/vigentes`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(listaPrecios: ListaPreciosRequest): Observable<ListaPreciosResponse> {
    return this.http.post<ListaPreciosResponse>(this.apiUrl, listaPrecios).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  update(id: number, listaPrecios: ListaPreciosRequest): Observable<ListaPreciosResponse> {
    return this.http.put<ListaPreciosResponse>(`${this.apiUrl}/${id}`, listaPrecios).pipe(
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
