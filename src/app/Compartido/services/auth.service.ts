import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio de autenticación
 * Maneja login, logout y estado de autenticación
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // BehaviorSubject para estado reactivo de autenticación
  private readonly currentUserLoginOn: BehaviorSubject<boolean>;
  private readonly currentUserData: BehaviorSubject<string>;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    // Al iniciar, verifica si ya hay un token en sessionStorage
    if (typeof globalThis.window !== 'undefined' && sessionStorage) {
      this.currentUserLoginOn = new BehaviorSubject<boolean>(
        sessionStorage.getItem('token') != null
      );
      this.currentUserData = new BehaviorSubject<string>(
        sessionStorage.getItem('token') || ''
      );
    } else {
      this.currentUserLoginOn = new BehaviorSubject<boolean>(false);
      this.currentUserData = new BehaviorSubject<string>('');
    }
  }

  /**
   * Login de usuario
   * Envía las credenciales al backend y almacena el token recibido
   * @param credentials Credenciales del usuario
   * @returns Observable con el token
   */
  login(credentials: LoginRequest): Observable<string> {
    return this.http.post<AuthResponse>(
      `${environment.urlhost}/api/auth/login`, 
      credentials
    ).pipe(
      tap((response) => {
        sessionStorage.setItem('token', response.token);
        this.currentUserData.next(response.token);
        this.currentUserLoginOn.next(true);
      }),
      map((response) => response.token),
      catchError(this.handleError)
    );
  }

  /**
   * Logout de usuario
   * Elimina el token y redirige al login
   */
  logout(): void {
    sessionStorage.removeItem('token');
    this.currentUserLoginOn.next(false);
    this.currentUserData.next('');
    this.router.navigateByUrl('/login');
  }

  /**
   * Observable del estado de login
   */
  get userLoginOn(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }

  /**
   * Observable de los datos del usuario (token)
   */
  get userData(): Observable<string> {
    return this.currentUserData.asObservable();
  }

  /**
   * Getter síncrono del token (usado por el interceptor)
   */
  get userToken(): string {
    return this.currentUserData.value;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  get isAuthenticated(): boolean {
    return this.currentUserLoginOn.value;
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = error.error?.message || error.error?.error || 'Credenciales inválidas';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
