import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { DetalleFacturaRequest, DetalleFacturaResponse } from '../Entidad/detalle-factura.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetalleFacturaService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/detalles-factura`;

  constructor(private readonly http: HttpClient) {}

  obtenerTodos(): Observable<DetalleFacturaResponse[]> {
    return this.http.get<DetalleFacturaResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorId(id: number): Observable<DetalleFacturaResponse> {
    return this.http.get<DetalleFacturaResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  obtenerPorFactura(facturaId: number): Observable<DetalleFacturaResponse[]> {
    if (!facturaId || facturaId <= 0) {
      return throwError(() => new Error('ID de factura no válido'));
    }
    
    return this.http.get<DetalleFacturaResponse[]>(`${this.apiUrl}/factura/${facturaId}`).pipe(
      catchError(this.handleError)
    );
  }

  obtenerPorProducto(productoId: number): Observable<DetalleFacturaResponse[]> {
    return this.http.get<DetalleFacturaResponse[]>(`${this.apiUrl}/producto/${productoId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  crear(detalle: DetalleFacturaRequest): Observable<DetalleFacturaResponse> {
    return this.http.post<DetalleFacturaResponse>(this.apiUrl, detalle).pipe(
      catchError(this.handleError)
    );
  }

  actualizar(id: number, detalle: DetalleFacturaRequest): Observable<DetalleFacturaResponse> {
    return this.http.put<DetalleFacturaResponse>(`${this.apiUrl}/${id}`, detalle).pipe(
      catchError(this.handleError)
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error en la operación';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 400) {
      errorMessage = error.error?.mensaje || error.error?.message || 
                    'Solicitud incorrecta. Verifique que la factura tenga detalles registrados.';
    } else if (error.status === 404) {
      errorMessage = 'No se encontraron detalles para esta factura';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor';
    } else {
      errorMessage = error.error?.mensaje || error.error?.message || error.message || errorMessage;
    }
    
    console.error('Error en DetalleFacturaService:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error,
      message: errorMessage
    });
    
    return throwError(() => new Error(errorMessage));
  }
}
