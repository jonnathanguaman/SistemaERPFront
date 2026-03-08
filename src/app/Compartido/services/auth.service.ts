import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { environment } from '../../../environments/environment';

/**
 * Servicio de autenticación
 * Maneja login, logout, estado de autenticación y roles
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // BehaviorSubject para estado reactivo de autenticación
  private readonly currentUserLoginOn: BehaviorSubject<boolean>;
  private readonly currentUserData: BehaviorSubject<string>;
  private readonly currentUserRoles: BehaviorSubject<string[]>;
  private readonly currentUserName: BehaviorSubject<string>;
  private readonly currentUsername: BehaviorSubject<string>;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    if (typeof globalThis.window !== 'undefined' && sessionStorage) {
      this.currentUserLoginOn = new BehaviorSubject<boolean>(
        sessionStorage.getItem('token') != null
      );
      this.currentUserData = new BehaviorSubject<string>(
        sessionStorage.getItem('token') || ''
      );
      this.currentUserRoles = new BehaviorSubject<string[]>(
        JSON.parse(sessionStorage.getItem('roles') || '[]')
      );
      this.currentUserName = new BehaviorSubject<string>(
        sessionStorage.getItem('nombre') || ''
      );
      this.currentUsername = new BehaviorSubject<string>(
        sessionStorage.getItem('username') || ''
      );
    } else {
      this.currentUserLoginOn = new BehaviorSubject<boolean>(false);
      this.currentUserData = new BehaviorSubject<string>('');
      this.currentUserRoles = new BehaviorSubject<string[]>([]);
      this.currentUserName = new BehaviorSubject<string>('');
      this.currentUsername = new BehaviorSubject<string>('');
    }
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginRequest): Observable<string> {
    return this.http.post<AuthResponse>(
      `${environment.urlhost}/api/auth/login`, 
      credentials
    ).pipe(
      tap((response) => {
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('roles', JSON.stringify(response.roles || []));
        sessionStorage.setItem('nombre', response.nombre || '');
        sessionStorage.setItem('username', response.username || '');
        this.currentUserData.next(response.token);
        this.currentUserRoles.next(response.roles || []);
        this.currentUserName.next(response.nombre || '');
        this.currentUsername.next(response.username || '');
        this.currentUserLoginOn.next(true);
      }),
      map((response) => response.token),
      catchError(this.handleError)
    );
  }

  /**
   * Logout de usuario
   */
  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('roles');
    sessionStorage.removeItem('nombre');
    sessionStorage.removeItem('username');
    this.currentUserLoginOn.next(false);
    this.currentUserData.next('');
    this.currentUserRoles.next([]);
    this.currentUserName.next('');
    this.currentUsername.next('');
    this.router.navigateByUrl('/login');
  }

  /** Observable del estado de login */
  get userLoginOn(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }

  /** Observable de los datos del usuario (token) */
  get userData(): Observable<string> {
    return this.currentUserData.asObservable();
  }

  /** Getter síncrono del token */
  get userToken(): string {
    return this.currentUserData.value;
  }

  /** Verifica si el usuario está autenticado */
  get isAuthenticated(): boolean {
    return this.currentUserLoginOn.value;
  }

  /** Observable de los roles del usuario */
  get userRoles$(): Observable<string[]> {
    return this.currentUserRoles.asObservable();
  }

  /** Getter síncrono de los roles */
  get userRoles(): string[] {
    return this.currentUserRoles.value;
  }

  /** Observable del nombre del usuario */
  get userName$(): Observable<string> {
    return this.currentUserName.asObservable();
  }

  /** Getter síncrono del nombre */
  get userName(): string {
    return this.currentUserName.value;
  }

  /** Getter síncrono del username */
  get username(): string {
    return this.currentUsername.value;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    return this.userRoles.some(r => roles.includes(r));
  }

  /**
   * Verifica si el usuario tiene acceso a un módulo específico.
   * Lee la configuración de permisos desde localStorage (gestionada por PermisosRolComponent).
   * Si no hay configuración guardada, usa los permisos por defecto.
   */
  hasModuleAccess(module: string): boolean {
    const roles = this.userRoles;
    // Administrador y Gerente siempre tienen acceso a todo
    if (roles.includes('Administrador') || roles.includes('Gerente')) {
      return true;
    }

    // Intentar leer permisos configurados desde localStorage
    const saved = localStorage.getItem('role_permissions');
    if (saved) {
      const permissions: { roleName: string; modules: Record<string, boolean> }[] = JSON.parse(saved);
      return roles.some(userRole => {
        const roleConfig = permissions.find(p => p.roleName === userRole);
        return roleConfig?.modules[module] === true;
      });
    }

    // Permisos por defecto si no hay configuración guardada
    const defaultPermissions: Record<string, string[]> = {
      'ventas': ['Vendedor', 'Contador'],
      'inventario': ['Vendedor', 'Bodeguero'],
      'compras': ['Compras'],
      'empleados': [],
      'empresa': []
    };

    const allowedRoles = defaultPermissions[module];
    if (!allowedRoles) return false;
    return roles.some(r => allowedRoles.includes(r));
  }

  /**
   * Manejo de errores HTTP
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ha ocurrido un error';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || error.error?.error || 'Credenciales inválidas';
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
