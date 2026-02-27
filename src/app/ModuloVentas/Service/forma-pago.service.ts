import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { FormaPagoRequest, FormaPagoResponse } from '../Entidad/forma-pago.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormaPagoService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/formas-pago`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<FormaPagoResponse[]> {
    return this.http.get<FormaPagoResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<FormaPagoResponse> {
    return this.http.get<FormaPagoResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findActivos(): Observable<FormaPagoResponse[]> {
    return this.http.get<FormaPagoResponse[]>(`${this.apiUrl}/activos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByCodigo(codigo: string): Observable<FormaPagoResponse> {
    return this.http.get<FormaPagoResponse>(`${this.apiUrl}/codigo/${codigo}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByRequiereReferencia(requiereReferencia: boolean): Observable<FormaPagoResponse[]> {
    return this.http.get<FormaPagoResponse[]>(`${this.apiUrl}/requiere-referencia`, {
      params: { requiereReferencia: requiereReferencia.toString() }
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(formaPago: FormaPagoRequest): Observable<FormaPagoResponse> {
    return this.http.post<FormaPagoResponse>(this.apiUrl, formaPago).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, formaPago: FormaPagoRequest): Observable<FormaPagoResponse> {
    return this.http.put<FormaPagoResponse>(`${this.apiUrl}/${id}`, formaPago).pipe(
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
      errorMessage = 'Forma de pago no encontrada';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 409) {
      errorMessage = 'La forma de pago ya existe con ese código';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
