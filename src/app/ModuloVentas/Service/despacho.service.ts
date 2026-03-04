import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { DespachoRequest, DespachoResponse } from '../Entidad/despacho.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DespachoService {
  private readonly apiUrl = `${environment.apiUrl}/ventas/despachos`;

  constructor(private readonly http: HttpClient) {}

  // CRUD Básico
  save(request: DespachoRequest): Observable<DespachoResponse> {
    return this.http.post<DespachoResponse>(this.apiUrl, request).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  update(id: number, request: DespachoRequest): Observable<DespachoResponse> {
    return this.http.put<DespachoResponse>(`${this.apiUrl}/${id}`, request).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findById(id: number): Observable<DespachoResponse> {
    return this.http.get<DespachoResponse>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findAll(): Observable<DespachoResponse[]> {
    return this.http.get<DespachoResponse[]>(this.apiUrl).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findAllIncludingInactive(): Observable<DespachoResponse[]> {
    return this.http.get<DespachoResponse[]>(`${this.apiUrl}/todos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Filtros
  findByEstado(estado: string): Observable<DespachoResponse[]> {
    return this.http.get<DespachoResponse[]>(`${this.apiUrl}/estado/${estado}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByOrdenVenta(ordenVentaId: number): Observable<DespachoResponse[]> {
    return this.http.get<DespachoResponse[]>(`${this.apiUrl}/orden-venta/${ordenVentaId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByBodega(bodegaId: number): Observable<DespachoResponse[]> {
    return this.http.get<DespachoResponse[]>(`${this.apiUrl}/bodega/${bodegaId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findByRangoFechas(inicio: string, fin: string): Observable<DespachoResponse[]> {
    const params = new HttpParams()
      .set('inicio', inicio)
      .set('fin', fin);
    
    return this.http.get<DespachoResponse[]>(`${this.apiUrl}/rango-fechas`, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  findVencidos(): Observable<DespachoResponse[]> {
    return this.http.get<DespachoResponse[]>(`${this.apiUrl}/vencidos`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  buscar(query: string): Observable<DespachoResponse[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<DespachoResponse[]>(`${this.apiUrl}/buscar`, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Workflow
  iniciarPreparacion(id: number): Observable<DespachoResponse> {
    return this.http.patch<DespachoResponse>(`${this.apiUrl}/${id}/iniciar-preparacion`, {}).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  marcarPreparado(id: number, responsableId: number): Observable<DespachoResponse> {
    const params = new HttpParams().set('responsableId', responsableId.toString());
    return this.http.patch<DespachoResponse>(`${this.apiUrl}/${id}/marcar-preparado`, {}, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  despachar(id: number, responsableId: number): Observable<DespachoResponse> {
    const params = new HttpParams().set('responsableId', responsableId.toString());
    return this.http.patch<DespachoResponse>(`${this.apiUrl}/${id}/despachar`, {}, { params }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  confirmarEntrega(id: number, nombreRecibe: string, cedulaRecibe: string): Observable<DespachoResponse> {
    const body = { nombreRecibe, cedulaRecibe };
    return this.http.patch<DespachoResponse>(`${this.apiUrl}/${id}/confirmar-entrega`, body).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  cancelar(id: number): Observable<DespachoResponse> {
    return this.http.patch<DespachoResponse>(`${this.apiUrl}/${id}/cancelar`, {}).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Estadísticas
  contarPorEstado(estado: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/estadisticas/contar/${estado}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || error.message || errorMessage;
    }
    return throwError(() => new Error(errorMessage));
  }
}
