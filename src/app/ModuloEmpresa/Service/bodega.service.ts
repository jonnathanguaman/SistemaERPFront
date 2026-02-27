import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { BodegaRequest, BodegaResponse } from '../Entidad/bodega.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class BodegaService {
    private readonly apiUrl = `${environment.apiUrl}/bodega`;

    constructor(private readonly http: HttpClient) {}

    findAll(): Observable<BodegaResponse[]> {
        return this.http.get<BodegaResponse[]>(this.apiUrl).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    findById(id: number): Observable<BodegaResponse> {
        return this.http.get<BodegaResponse>(`${this.apiUrl}/${id}`).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    findByCodigo(codigo: string): Observable<BodegaResponse> {
        return this.http.get<BodegaResponse>(`${this.apiUrl}/codigo/${codigo}`).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    save(bodega: BodegaRequest): Observable<BodegaResponse> {
        return this.http.post<BodegaResponse>(this.apiUrl, bodega).pipe(
        catchError(this.handleError)
        );
    }

    update(id: number, bodega: BodegaRequest): Observable<BodegaResponse> {
        return this.http.put<BodegaResponse>(`${this.apiUrl}/${id}`, bodega).pipe(
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
        errorMessage = 'Bodega no encontrada';
        } else if (error.status === 409) {
        errorMessage = 'Ya existe una bodega con ese código';
        } else if (error.status === 500) {
        errorMessage = 'Error del servidor';
        }
        
        return throwError(() => new Error(errorMessage));
    }
}
