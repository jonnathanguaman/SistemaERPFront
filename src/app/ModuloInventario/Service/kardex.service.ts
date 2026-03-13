import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { KardexCapaFifoResponse, KardexRegistroResponse } from '../Entidad/kardex.model';

@Injectable({
  providedIn: 'root'
})
export class KardexService {
  private readonly apiUrl = `${environment.apiUrl}/kardex`;

  constructor(private readonly http: HttpClient) {}

  consultarKardex(productoId: number, bodegaId: number, desde?: string, hasta?: string): Observable<KardexRegistroResponse[]> {
    let params = new HttpParams().set('bodegaId', bodegaId.toString());

    if (desde) {
      params = params.set('desde', desde);
    }

    if (hasta) {
      params = params.set('hasta', hasta);
    }

    return this.http.get<KardexRegistroResponse[]>(`${this.apiUrl}/producto/${productoId}`, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerCapasFifo(productoId: number, bodegaId: number): Observable<KardexCapaFifoResponse[]> {
    const params = new HttpParams().set('bodegaId', bodegaId.toString());

    return this.http.get<KardexCapaFifoResponse[]>(`${this.apiUrl}/producto/${productoId}/capas-fifo`, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerCostoActual(productoId: number, bodegaId: number): Observable<number> {
    const params = new HttpParams().set('bodegaId', bodegaId.toString());

    return this.http.get<number>(`${this.apiUrl}/producto/${productoId}/costo-actual`, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error al consultar el kardex';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status === 404) {
      errorMessage = 'No se encontró información de kardex para el criterio seleccionado';
    } else if (error.status === 400) {
      errorMessage = 'Parámetros inválidos para consultar el kardex';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor al consultar el kardex';
    }

    return throwError(() => new Error(errorMessage));
  }
}