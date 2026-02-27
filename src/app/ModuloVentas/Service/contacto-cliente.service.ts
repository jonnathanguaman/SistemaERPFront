import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { ContactoClienteRequest, ContactoClienteResponse } from '../Entidad/contacto-cliente.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactoClienteService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/contactos-cliente`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ContactoClienteResponse[]> {
    return this.http.get<ContactoClienteResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<ContactoClienteResponse> {
    return this.http.get<ContactoClienteResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivos(): Observable<ContactoClienteResponse[]> {
    return this.http.get<ContactoClienteResponse[]>(`${this.apiUrl}/activos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCliente(clienteId: number): Observable<ContactoClienteResponse[]> {
    return this.http.get<ContactoClienteResponse[]>(`${this.apiUrl}/cliente/${clienteId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivosByCliente(clienteId: number): Observable<ContactoClienteResponse[]> {
    return this.http.get<ContactoClienteResponse[]>(`${this.apiUrl}/cliente/${clienteId}/activos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findPrincipalByCliente(clienteId: number): Observable<ContactoClienteResponse> {
    return this.http.get<ContactoClienteResponse>(`${this.apiUrl}/cliente/${clienteId}/principal`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(contacto: ContactoClienteRequest): Observable<ContactoClienteResponse> {
    return this.http.post<ContactoClienteResponse>(this.apiUrl, contacto).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, contacto: ContactoClienteRequest): Observable<ContactoClienteResponse> {
    return this.http.put<ContactoClienteResponse>(`${this.apiUrl}/${id}`, contacto).pipe(
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
      errorMessage = 'Contacto no encontrado';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
