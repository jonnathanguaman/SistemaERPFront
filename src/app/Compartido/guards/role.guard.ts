import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de roles - Protege rutas según el módulo requerido
 * Usa data.module en la ruta para determinar el acceso
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verificar autenticación primero
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // Obtener el módulo requerido de la data de la ruta
    const requiredModule = route.data['module'] as string;
    
    if (!requiredModule) {
      return true; // Sin restricción de módulo
    }

    // Verificar acceso al módulo
    if (this.authService.hasModuleAccess(requiredModule)) {
      return true;
    }

    // Sin acceso, redirigir a la primera ruta accesible
    this.router.navigate(['/sin-acceso']);
    return false;
  }
}
