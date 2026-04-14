import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor JWT
 * Agrega el token de autenticación a todas las peticiones HTTP
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private readonly authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token: string = this.authService.userToken;
    const empresaId = this.authService.empresaId;

    // Si no hay token, enviar la petición sin modificar
    if (!token || token === '') {
      return next.handle(req);
    }

    // Clonar la petición y agregar el header de autorización
    let clonedRequest: HttpRequest<any>;

    // Si la petición tiene FormData (upload de archivos), no establecer Content-Type
    if (req.body instanceof FormData) {
      clonedRequest = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
          ...(empresaId ? { 'X-Empresa-Id': String(empresaId) } : {})
        }
      });
    } else {
      clonedRequest = req.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(empresaId ? { 'X-Empresa-Id': String(empresaId) } : {})
        }
      });
    }

    return next.handle(clonedRequest);
  }
}
