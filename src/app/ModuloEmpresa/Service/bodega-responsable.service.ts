import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { BodegaResponsable } from '../Entidad/bodega-responsable.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BodegaResponsableService {
    private readonly apiUrl = `${environment.apiUrl}/empresa/bodegas-responsables`;

    constructor(private readonly http: HttpClient) {}

    findAll(): Observable<BodegaResponsable[]> {
        return this.http.get<BodegaResponsable[]>(this.apiUrl).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    findById(id: number): Observable<BodegaResponsable> {
        return this.http.get<BodegaResponsable>(`${this.apiUrl}/${id}`).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    findByBodegaId(bodegaId: number): Observable<BodegaResponsable[]> {
        return this.http.get<BodegaResponsable[]>(`${this.apiUrl}/bodega/${bodegaId}`).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    findActivos(): Observable<BodegaResponsable[]> {
        return this.http.get<BodegaResponsable[]>(`${this.apiUrl}/activos`).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    save(bodegaResponsable: BodegaResponsable): Observable<BodegaResponsable> {
        return this.http.post<BodegaResponsable>(this.apiUrl, bodegaResponsable).pipe(
        catchError(this.handleError)
        );
    }

    update(id: number, bodegaResponsable: BodegaResponsable): Observable<BodegaResponsable> {
        return this.http.put<BodegaResponsable>(`${this.apiUrl}/${id}`, bodegaResponsable).pipe(
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
        errorMessage = 'Bodega responsable no encontrada';
        } else if (error.status === 409) {
        errorMessage = 'Ya existe un responsable asignado para esta bodega';
        } else if (error.status === 500) {
        errorMessage = 'Error del servidor';
        }
        
        return throwError(() => new Error(errorMessage));
    }
}
