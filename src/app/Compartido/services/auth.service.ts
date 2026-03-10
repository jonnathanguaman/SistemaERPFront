import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly currentUserLoginOn: BehaviorSubject<boolean>;
  private readonly currentUserData: BehaviorSubject<string>;
  private readonly currentUserRoles: BehaviorSubject<string[]>;
  private readonly currentUserName: BehaviorSubject<string>;
  private readonly currentUsername: BehaviorSubject<string>;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    const token = sessionStorage.getItem('token') || '';
    const rolesFromToken = token ? this.extractRolesFromToken(token) : [];

    this.currentUserLoginOn = new BehaviorSubject<boolean>(!!token);
    this.currentUserData = new BehaviorSubject<string>(token);
    this.currentUserRoles = new BehaviorSubject<string[]>(rolesFromToken);
    this.currentUserName = new BehaviorSubject<string>(
      sessionStorage.getItem('nombre') || ''
    );
    this.currentUsername = new BehaviorSubject<string>(
      sessionStorage.getItem('username') || ''
    );
  }

  /**
   * Decodifica el payload del JWT y extrae los roles.
   * Los roles están firmados dentro del token, no pueden ser manipulados.
   */
  private extractRolesFromToken(token: string): string[] {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.roles || [];
    } catch {
      return [];
    }
  }

  login(credentials: LoginRequest): Observable<string> {
    return this.http.post<AuthResponse>(
      `${environment.urlhost}/api/auth/login`,
      credentials
    ).pipe(
      tap((response) => {
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('nombre', response.nombre || '');
        sessionStorage.setItem('username', response.username || '');

        const roles = this.extractRolesFromToken(response.token);

        this.currentUserData.next(response.token);
        this.currentUserRoles.next(roles);
        this.currentUserName.next(response.nombre || '');
        this.currentUsername.next(response.username || '');
        this.currentUserLoginOn.next(true);
      }),
      map((response) => response.token),
      catchError(this.handleError)
    );
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('nombre');
    sessionStorage.removeItem('username');
    this.currentUserLoginOn.next(false);
    this.currentUserData.next('');
    this.currentUserRoles.next([]);
    this.currentUserName.next('');
    this.currentUsername.next('');
    this.router.navigateByUrl('/login');
  }

  get userLoginOn(): Observable<boolean> {
    return this.currentUserLoginOn.asObservable();
  }

  get userData(): Observable<string> {
    return this.currentUserData.asObservable();
  }

  get userToken(): string {
    return this.currentUserData.value;
  }

  get isAuthenticated(): boolean {
    return this.currentUserLoginOn.value;
  }

  get userRoles$(): Observable<string[]> {
    return this.currentUserRoles.asObservable();
  }

  get userRoles(): string[] {
    return this.currentUserRoles.value;
  }

  get userName$(): Observable<string> {
    return this.currentUserName.asObservable();
  }

  get userName(): string {
    return this.currentUserName.value;
  }

  get username(): string {
    return this.currentUsername.value;
  }

  hasAnyRole(roles: string[]): boolean {
    return this.userRoles.some(r => roles.includes(r));
  }

  /**
   * Verifica acceso a un módulo.
   * Los roles vienen del JWT (firmados), no de sessionStorage ni localStorage.
   * Los permisos de localStorage solo controlan visibilidad del menú (UX),
   * la autorización real está en el backend con @PreAuthorize.
   */
  hasModuleAccess(module: string): boolean {
    const roles = this.userRoles;
    if (roles.includes('Administrador') || roles.includes('Gerente')) {
      return true;
    }

    // Leer configuración de permisos (solo para UX del menú, no es seguridad real)
    const saved = localStorage.getItem('role_permissions');
    if (saved) {
      const permissions: { roleName: string; modules: Record<string, boolean> }[] = JSON.parse(saved);
      return roles.some(userRole => {
        const roleConfig = permissions.find(p => p.roleName === userRole);
        return roleConfig?.modules[module] === true;
      });
    }

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
