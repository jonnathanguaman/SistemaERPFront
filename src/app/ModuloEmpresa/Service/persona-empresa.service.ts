import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { PersonaEmpresa } from '../Entidad/persona-empresa.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PersonaEmpresaService {
    private readonly apiUrl = `${environment.apiUrl}/empresa/personas-empresa`;

    constructor(private readonly http: HttpClient) {}

    findAll(): Observable<PersonaEmpresa[]> {
        return this.http.get<PersonaEmpresa[]>(this.apiUrl).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    findById(id: number): Observable<PersonaEmpresa> {
        return this.http.get<PersonaEmpresa>(`${this.apiUrl}/${id}`).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    findActivos(): Observable<PersonaEmpresa[]> {
        return this.http.get<PersonaEmpresa[]>(`${this.apiUrl}/activos`).pipe(
        retry(1),
        catchError(this.handleError)
        );
    }

    save(personaEmpresa: PersonaEmpresa): Observable<PersonaEmpresa> {
        return this.http.post<PersonaEmpresa>(this.apiUrl, personaEmpresa).pipe(
        catchError(this.handleError)
        );
    }

    update(id: number, personaEmpresa: PersonaEmpresa): Observable<PersonaEmpresa> {
        return this.http.put<PersonaEmpresa>(`${this.apiUrl}/${id}`, personaEmpresa).pipe(
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
        errorMessage = 'Persona empresa no encontrada';
        } else if (error.status === 409) {
        errorMessage = 'Ya existe una asignación para esta persona en esta empresa';
        } else if (error.status === 500) {
        errorMessage = 'Error del servidor';
        }
        
        return throwError(() => new Error(errorMessage));
    }
}
