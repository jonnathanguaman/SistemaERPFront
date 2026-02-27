import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { PersonaRequest, PersonaResponse } from '../Entidades/persona.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio para gestión de empleados (Personas)
 * Conecta con el backend Spring Boot
 */
@Injectable({
    providedIn: 'root'
})
export class PersonaService {
    private readonly apiUrl = `${environment.apiUrl}/personas`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
        'Content-Type': 'application/json'
        })
    };

    constructor(private readonly http: HttpClient) { }

    /**
     * Obtener todos los empleados
     * @returns Observable con array de personas
     */
    findAll(): Observable<PersonaResponse[]> {
        return this.http.get<PersonaResponse[]>(this.apiUrl)
        .pipe(
            retry(2), // Reintentar 2 veces en caso de error
            catchError(this.handleError)
        );
    }

    /**
     * Obtener un empleado por ID
     * @param id ID del empleado
     * @returns Observable con los datos del empleado
     */
    findById(id: number): Observable<PersonaResponse> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<PersonaResponse>(url)
        .pipe(
            retry(2),
            catchError(this.handleError)
        );
    }

    /**
     * Crear un nuevo empleado
     * @param persona Datos del empleado a crear
     * @returns Observable con el empleado creado
     */
    save(persona: PersonaRequest): Observable<PersonaResponse> {
        return this.http.post<PersonaResponse>(this.apiUrl, persona, this.httpOptions)
        .pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Actualizar un empleado existente
     * @param id ID del empleado
     * @param persona Datos actualizados del empleado
     * @returns Observable con el empleado actualizado
     */
    update(id: number, persona: PersonaRequest): Observable<PersonaResponse> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.put<PersonaResponse>(url, persona, this.httpOptions)
        .pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Eliminar un empleado
     * @param id ID del empleado a eliminar
     * @returns Observable void
     */
    delete(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url)
        .pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Manejo de errores HTTP
     * @param error Error HTTP
     * @returns Observable con mensaje de error
     */
    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Ocurrió un error desconocido';

        if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
        } else {
        // Error del lado del servidor
        errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
        
        // Mensajes específicos según el código de error
        switch (error.status) {
            case 0:
            errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.';
            break;
            case 404:
            errorMessage = 'Empleado no encontrado.';
            break;
            case 400:
            errorMessage = 'Datos inválidos. Verifica la información ingresada.';
            break;
            case 500:
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
            break;
        }
        }
        return throwError(() => new Error(errorMessage));
    }
}
