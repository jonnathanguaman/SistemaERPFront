import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { ClienteRequest, ClienteResponse } from '../Entidad/cliente.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/clientes`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ClienteResponse[]> {
    return this.http.get<ClienteResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivos(): Observable<ClienteResponse[]> {
    return this.http.get<ClienteResponse[]>(`${this.apiUrl}/activos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByIdentificacion(numeroIdentificacion: string): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.apiUrl}/identificacion/${numeroIdentificacion}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  buscarPorRazonSocial(razonSocial: string): Observable<ClienteResponse[]> {
    return this.http.get<ClienteResponse[]>(`${this.apiUrl}/buscar`, {
      params: { razonSocial }
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByVendedor(vendedorId: number): Observable<ClienteResponse[]> {
    return this.http.get<ClienteResponse[]>(`${this.apiUrl}/vendedor/${vendedorId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(cliente: ClienteRequest): Observable<ClienteResponse> {
    return this.http.post<ClienteResponse>(this.apiUrl, cliente).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, cliente: ClienteRequest): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(`${this.apiUrl}/${id}`, cliente).pipe(
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
      errorMessage = 'Cliente no encontrado';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 409) {
      errorMessage = 'El cliente ya existe con ese número de identificación';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
