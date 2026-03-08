import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  // Estado del sidebar (colapsado o expandido)
  isCollapsed: boolean = false;
  
  // Módulo activo actual
  activeModule: string = 'dashboard';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // Cargar estado del sidebar desde localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = JSON.parse(savedState);
    }

    // Detectar el módulo activo desde la URL
    this.detectActiveModule();
  }

  /**
   * Alterna el estado colapsado/expandido del sidebar
   */
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    // Guardar el estado en localStorage
    localStorage.setItem('sidebarCollapsed', JSON.stringify(this.isCollapsed));
  }

  /**
   * Establece el módulo activo
   * Si el módulo ya está activo, lo cierra
   * @param module Nombre del módulo
   */
  setActiveModule(module: string): void {
    if (this.activeModule === module) {
      // Si el módulo ya está activo, lo cerramos
      this.activeModule = '';
    } else {
      // Si es un módulo diferente, lo activamos
      this.activeModule = module;
    }
  }

  /**
   * Detecta el módulo activo basándose en la URL actual
   */
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
    } else if (currentPath.includes('empleados') || currentPath.includes('roles')) {
      this.activeModule = 'empleados';
    } else if (currentPath.includes('empresa') || currentPath.includes('bodegas') || 
               currentPath.includes('personas-empresa') || currentPath.includes('procesos')) {
      this.activeModule = 'empresa';
    } else {
      this.activeModule = 'dashboard';
    }
  }

  /**
   * Maneja el cierre de sesión
   */
  logout(): void {
    // Confirmación antes de cerrar sesión
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      // Usar el servicio de autenticación para cerrar sesión
      this.authService.logout();
    }
  }
}
