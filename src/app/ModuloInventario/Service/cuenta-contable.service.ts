import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { CuentaContableRequest, CuentaContableResponse } from '../Entidad/cuenta-contable.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CuentaContableService {
  private readonly apiUrl = `${environment.apiUrl}/cuenta-contable`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<CuentaContableResponse[]> {
    return this.http.get<CuentaContableResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<CuentaContableResponse> {
    return this.http.get<CuentaContableResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(cuentaContable: CuentaContableRequest): Observable<CuentaContableResponse> {
    return this.http.post<CuentaContableResponse>(this.apiUrl, cuentaContable).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, cuentaContable: CuentaContableRequest): Observable<CuentaContableResponse> {
    return this.http.put<CuentaContableResponse>(`${this.apiUrl}/${id}`, cuentaContable).pipe(
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
      errorMessage = 'Cuenta contable no encontrada';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
