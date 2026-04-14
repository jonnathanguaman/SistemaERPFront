import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly authDebugPrefix = '[AUTH-DEBUG]';

  private readonly currentUserLoginOn: BehaviorSubject<boolean>;
  private readonly currentUserData: BehaviorSubject<string>;
  private readonly currentUserRoles: BehaviorSubject<string[]>;
  private readonly currentUserName: BehaviorSubject<string>;
  private readonly currentUsername: BehaviorSubject<string>;
  private readonly currentUserId: BehaviorSubject<number | null>;
  private readonly currentEmpresaId: BehaviorSubject<number | null>;

  private readonly meEndpoint = `${environment.urlhost}/api/auth/me`;
  private readonly cambiarEmpresaEndpoint = `${environment.urlhost}/api/auth/cambiar-empresa`;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    const token = sessionStorage.getItem('token') || '';
    const rolesFromToken = token ? this.extractRolesFromToken(token) : [];
    const userIdFromSession = sessionStorage.getItem('usuarioId');
    const empresaIdFromSession = sessionStorage.getItem('empresaId');

    let userId: number | null = null;
    if (userIdFromSession) {
      const parsedUserId = Number(userIdFromSession);
      userId = Number.isFinite(parsedUserId) && parsedUserId > 0 ? parsedUserId : null;
    } else if (token) {
      userId = this.extractUserIdFromToken(token);
    }

    this.currentUserLoginOn = new BehaviorSubject<boolean>(!!token);
    this.currentUserData = new BehaviorSubject<string>(token);
    this.currentUserRoles = new BehaviorSubject<string[]>(rolesFromToken);
    this.currentUserName = new BehaviorSubject<string>(
      sessionStorage.getItem('nombre') || ''
    );
    this.currentUsername = new BehaviorSubject<string>(
      sessionStorage.getItem('username') || ''
    );
    this.currentUserId = new BehaviorSubject<number | null>(
      Number.isFinite(userId as number) ? userId : null
    );
    const empresaId = empresaIdFromSession
      ? Number(empresaIdFromSession)
      : this.extractEmpresaIdFromToken(token);
    this.currentEmpresaId = new BehaviorSubject<number | null>(
      Number.isFinite(empresaId as number) && (empresaId as number) > 0 ? (empresaId as number) : null
    );

    this.logAuthState('constructor-init');

    if (!!token && !this.currentUserId.value) {
      this.resolveUserIdFromBackend('constructor-fallback').subscribe();
    }
  }

  private resolveUserIdFromBackend(context: string): Observable<number | null> {
    return this.http.get<{ username?: string; usuarioId?: number }>(this.meEndpoint).pipe(
      map((response) => {
        const resolvedUserId = Number(response?.usuarioId);
        if (Number.isFinite(resolvedUserId) && resolvedUserId > 0) {
          sessionStorage.setItem('usuarioId', String(resolvedUserId));
          this.currentUserId.next(resolvedUserId);
          console.log(this.authDebugPrefix, `${context}-resolved-from-backend`, {
            meEndpoint: this.meEndpoint,
            username: response?.username ?? null,
            usuarioId: resolvedUserId
          });
          this.logAuthState(`${context}-post-resolve`);
          return resolvedUserId;
        }

        console.warn(this.authDebugPrefix, `${context}-backend-without-usuarioId`, {
          meEndpoint: this.meEndpoint,
          response
        });
        return null;
      }),
      catchError((error) => {
        console.error(this.authDebugPrefix, `${context}-backend-resolve-failed`, {
          meEndpoint: this.meEndpoint,
          status: error?.status,
          message: error?.message
        });
        return of(null);
      })
    );
  }

  private logAuthState(context: string): void {
    const token = this.currentUserData?.value || sessionStorage.getItem('token') || '';
    const decoded = token ? this.decodeTokenPayload(token) : null;
    const keys = decoded ? Object.keys(decoded) : [];

    console.log(this.authDebugPrefix, context, {
      sessionUsuarioId: sessionStorage.getItem('usuarioId'),
      sessionUsername: sessionStorage.getItem('username'),
      hasToken: !!token,
      tokenLength: token.length,
      tokenClaimsKeys: keys,
      tokenUsuarioId: decoded?.['usuarioId'] ?? null,
      tokenUserId: decoded?.['userId'] ?? null,
      tokenId: decoded?.['id'] ?? null,
      tokenIdAuth: decoded?.['idAuth'] ?? null,
      tokenEmpresaId: decoded?.['empresaId'] ?? null,
      behaviorUserId: this.currentUserId?.value ?? null,
      behaviorEmpresaId: this.currentEmpresaId?.value ?? null,
      behaviorRoles: this.currentUserRoles?.value ?? []
    });
  }

  debugAuthState(context: string = 'manual'): void {
    this.logAuthState(context);
  }

  private decodeTokenPayload(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replaceAll('-', '+').replaceAll('_', '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4 || 4)) % 4, '=');
      return JSON.parse(atob(padded)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  /**
   * Decodifica el payload del JWT y extrae los roles.
   * Los roles están firmados dentro del token, no pueden ser manipulados.
   */
  private extractRolesFromToken(token: string): string[] {
    const decoded = this.decodeTokenPayload(token);
    const roles = decoded?.['roles'];
    if (!Array.isArray(roles)) {
      return [];
    }

    return roles.filter((role): role is string => typeof role === 'string');
  }

  private extractUserIdFromToken(token: string): number | null {
    const decoded = this.decodeTokenPayload(token);
    if (!decoded) {
      return null;
    }

    const candidato =
      decoded['usuarioId'] ??
      decoded['userId'] ??
      decoded['id'] ??
      decoded['idAuth'] ??
      null;
    const numeric = Number(candidato);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }

  private extractEmpresaIdFromToken(token: string): number | null {
    const decoded = this.decodeTokenPayload(token);
    if (!decoded) {
      return null;
    }

    const candidato = decoded['empresaId'] ?? null;
    const numeric = Number(candidato);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  }

  login(credentials: LoginRequest): Observable<string> {
    console.log(this.authDebugPrefix, 'login-request', {
      apiHost: environment.urlhost,
      username: credentials.username
    });

    return this.http.post<AuthResponse>(
      `${environment.urlhost}/api/auth/login`,
      credentials
    ).pipe(
      tap((response) => {
        console.log(this.authDebugPrefix, 'login-response', {
          username: response.username,
          usuarioId: response.usuarioId ?? null,
          hasToken: !!response.token,
          tokenLength: response.token?.length || 0
        });

        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('nombre', response.nombre || '');
        sessionStorage.setItem('username', response.username || '');

        const userId = response.usuarioId ?? this.extractUserIdFromToken(response.token);
        const empresaId = response.empresaId ?? this.extractEmpresaIdFromToken(response.token);
        if (userId) {
          sessionStorage.setItem('usuarioId', String(userId));
        } else {
          sessionStorage.removeItem('usuarioId');
        }

        if (empresaId) {
          sessionStorage.setItem('empresaId', String(empresaId));
        } else {
          sessionStorage.removeItem('empresaId');
        }

        const roles = this.extractRolesFromToken(response.token);

        this.currentUserData.next(response.token);
        this.currentUserRoles.next(roles);
        this.currentUserName.next(response.nombre || '');
        this.currentUsername.next(response.username || '');
        this.currentUserId.next(userId || null);
        this.currentEmpresaId.next(empresaId || null);
        this.currentUserLoginOn.next(true);
        this.logAuthState('login-success');

        if (!this.currentUserId.value) {
          this.resolveUserIdFromBackend('login-fallback').subscribe();
        }
      }),
      map((response) => response.token),
      catchError(this.handleError)
    );
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('nombre');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('usuarioId');
    sessionStorage.removeItem('empresaId');
    this.currentUserLoginOn.next(false);
    this.currentUserData.next('');
    this.currentUserRoles.next([]);
    this.currentUserName.next('');
    this.currentUsername.next('');
    this.currentUserId.next(null);
    this.currentEmpresaId.next(null);
    this.logAuthState('logout');
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

  get userId(): number | null {
    return this.currentUserId.value;
  }

  get empresaId(): number | null {
    return this.currentEmpresaId.value;
  }

  cambiarEmpresaActiva(empresaId: number): Observable<string> {
    return this.http.post<AuthResponse>(this.cambiarEmpresaEndpoint, { empresaId }).pipe(
      tap((response) => {
        sessionStorage.setItem('token', response.token);

        const empresaActiva = response.empresaId ?? this.extractEmpresaIdFromToken(response.token);
        if (empresaActiva) {
          sessionStorage.setItem('empresaId', String(empresaActiva));
        }

        const roles = this.extractRolesFromToken(response.token);
        this.currentUserData.next(response.token);
        this.currentUserRoles.next(roles);
        this.currentEmpresaId.next(empresaActiva || null);
        this.logAuthState('cambiar-empresa-success');
      }),
      map((response) => response.token),
      catchError(this.handleError)
    );
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
