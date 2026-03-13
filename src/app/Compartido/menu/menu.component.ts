import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  isCollapsed: boolean = false;
  activeModule: string = 'dashboard';
  
  userName: string = '';
  userRole: string = '';

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = JSON.parse(savedState);
    }

    this.userName = this.authService.userName || 'Usuario';
    const roles = this.authService.userRoles;
    this.userRole = roles.length > 0 ? roles[0] : 'Sin rol';

    this.detectActiveModule();
  }

  /**
   * Verifica si el usuario tiene acceso a un módulo del menú
   */
  hasAccess(module: string): boolean {
    return this.authService.hasModuleAccess(module);
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebarCollapsed', JSON.stringify(this.isCollapsed));
  }

  setActiveModule(module: string): void {
    if (this.activeModule === module) {
      this.activeModule = '';
    } else {
      this.activeModule = module;
    }
  }

  detectActiveModule(): void {
    const currentPath = globalThis.location.pathname;
    if (currentPath.includes('clientes') || currentPath.includes('contactos-cliente') || 
        currentPath.includes('direcciones-cliente') || currentPath.includes('facturas') || 
        currentPath.includes('ventas') || currentPath.includes('cobros') || 
        currentPath.includes('condiciones-pago') || currentPath.includes('formas-pago') || 
        currentPath.includes('cuentas-por-cobrar') || currentPath.includes('cotizaciones') ||
        currentPath.includes('detalles-cotizacion') || currentPath.includes('notas-credito') ||
        currentPath.includes('detalles-nota-credito') || currentPath.includes('ordenes-venta') ||
        currentPath.includes('detalles-orden-venta')) {
      this.activeModule = 'ventas';
    } else if (currentPath.includes('compras') || currentPath.includes('proveedores') || 
               currentPath.includes('ordenes-compra') || currentPath.includes('recepciones')) {
      this.activeModule = 'compras';
    } else if (currentPath.includes('inventario') || currentPath.includes('productos') || 
               currentPath.includes('categorias') || currentPath.includes('grupos')) {
      this.activeModule = 'inventario';
    } else if (currentPath.includes('empleados') || currentPath.includes('roles') ||
               currentPath.includes('permisos-rol')) {
      this.activeModule = 'empleados';
    } else if (currentPath.includes('empresa') || currentPath.includes('bodegas') || 
               currentPath.includes('personas-empresa') || currentPath.includes('procesos')) {
      this.activeModule = 'empresa';
    } else {
      this.activeModule = 'dashboard';
    }
  }

  async logout(): Promise<void> {
    const confirmed = await this.notificationService.confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmed) {
      this.authService.logout();
    }
  }
}
