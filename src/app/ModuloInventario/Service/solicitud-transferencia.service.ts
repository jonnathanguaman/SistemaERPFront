import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { SolicitudTransferenciaRequest, SolicitudTransferenciaResponse } from '../Entidad/solicitud-transferencia.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SolicitudTransferenciaService {
  private readonly apiUrl = `${environment.apiUrl}/inventario/solicitudes-transferencia`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<SolicitudTransferenciaResponse[]> {
    return this.http.get<SolicitudTransferenciaResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<SolicitudTransferenciaResponse> {
    return this.http.get<SolicitudTransferenciaResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByEstado(estado: string): Observable<SolicitudTransferenciaResponse[]> {
    return this.http.get<SolicitudTransferenciaResponse[]>(`${this.apiUrl}/estado/${estado}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByBodegaOrigen(bodegaId: number): Observable<SolicitudTransferenciaResponse[]> {
    return this.http.get<SolicitudTransferenciaResponse[]>(`${this.apiUrl}/bodega-origen/${bodegaId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByBodegaDestino(bodegaId: number): Observable<SolicitudTransferenciaResponse[]> {
    return this.http.get<SolicitudTransferenciaResponse[]>(`${this.apiUrl}/bodega-destino/${bodegaId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  save(solicitud: SolicitudTransferenciaRequest): Observable<SolicitudTransferenciaResponse> {
    return this.http.post<SolicitudTransferenciaResponse>(this.apiUrl, solicitud).pipe(
      catchError(this.handleError)
    );
  }

  update(id: number, solicitud: SolicitudTransferenciaRequest): Observable<SolicitudTransferenciaResponse> {
    return this.http.put<SolicitudTransferenciaResponse>(`${this.apiUrl}/${id}`, solicitud).pipe(
      catchError(this.handleError)
    );
  }

  enviar(id: number): Observable<SolicitudTransferenciaResponse> {
    return this.http.patch<SolicitudTransferenciaResponse>(`${this.apiUrl}/${id}/enviar`, {}).pipe(
      catchError(this.handleError)
    );
  }

  aprobar(id: number, usuarioAprobacionId: number): Observable<SolicitudTransferenciaResponse> {
    const params = new HttpParams().set('usuarioAprobacionId', usuarioAprobacionId.toString());
    return this.http.patch<SolicitudTransferenciaResponse>(`${this.apiUrl}/${id}/aprobar`, {}, { params }).pipe(
      catchError(this.handleError)
    );
  }

  rechazar(id: number, motivoRechazo: string): Observable<SolicitudTransferenciaResponse> {
    const params = new HttpParams().set('motivoRechazo', motivoRechazo);
    return this.http.patch<SolicitudTransferenciaResponse>(`${this.apiUrl}/${id}/rechazar`, {}, { params }).pipe(
      catchError(this.handleError)
    );
  }

  completar(id: number, usuarioId: number): Observable<SolicitudTransferenciaResponse> {
    const params = new HttpParams().set('usuarioId', usuarioId.toString());
    return this.http.patch<SolicitudTransferenciaResponse>(`${this.apiUrl}/${id}/completar`, {}, { params }).pipe(
      catchError(this.handleError)
    );
  }

  anular(id: number): Observable<SolicitudTransferenciaResponse> {
    return this.http.patch<SolicitudTransferenciaResponse>(`${this.apiUrl}/${id}/anular`, {}).pipe(
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
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 404) {
      errorMessage = 'Solicitud no encontrada';
    } else if (error.status === 409) {
      errorMessage = 'Ya existe una solicitud con ese número';
    } else if (error.status === 500) {
      errorMessage = 'Error del servidor';
    }
    return throwError(() => new Error(errorMessage));
  }
}
