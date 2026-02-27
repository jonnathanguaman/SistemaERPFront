import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { EmpresaRequest, EmpresaResponse } from '../Entidad/empresa.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class EmpresaService {
    private readonly apiUrl = `${environment.apiUrl}/empresa`;

    constructor(private readonly http: HttpClient) {}

    findAll(): Observable<EmpresaResponse[]> {
        return this.http.get<EmpresaResponse[]>(this.apiUrl).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    findById(id: number): Observable<EmpresaResponse> {
        return this.http.get<EmpresaResponse>(`${this.apiUrl}/${id}`).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    findByNit(nit: string): Observable<EmpresaResponse> {
        return this.http.get<EmpresaResponse>(`${this.apiUrl}/nit/${nit}`).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    save(empresa: EmpresaRequest): Observable<EmpresaResponse> {
        return this.http.post<EmpresaResponse>(this.apiUrl, empresa).pipe(
        catchError(this.handleError)
        );
    }

    update(id: number, empresa: EmpresaRequest): Observable<EmpresaResponse> {
        return this.http.put<EmpresaResponse>(`${this.apiUrl}/${id}`, empresa).pipe(
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
        errorMessage = 'Empresa no encontrada';
        } else if (error.status === 409) {
        errorMessage = 'Ya existe una empresa con ese NIT';
        } else if (error.status === 500) {
        errorMessage = 'Error del servidor';
        }
        
        return throwError(() => new Error(errorMessage));
    }
}
