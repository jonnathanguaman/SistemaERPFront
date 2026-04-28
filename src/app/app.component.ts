import { Component, HostListener } from '@angular/core';
import { AuthService } from './Compartido/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ERP Sistema de Gestión';
  isAuthenticated: boolean = false;
  isSidebarCollapsed: boolean = false;

  constructor(private readonly authService: AuthService) {
    // Suscribirse al estado de autenticación
    this.authService.userLoginOn.subscribe(
      (isLoggedIn) => {
        this.isAuthenticated = isLoggedIn;
        if (isLoggedIn) {
          this.syncSidebarStateFromStorage();
        }
      }
    );

    this.syncSidebarStateFromStorage();
  }

  /**
   * Sincroniza el estado del sidebar desde almacenamiento local.
   */
  private syncSidebarStateFromStorage(): void {
    this.isSidebarCollapsed = JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false');
  }

  /**
   * Escucha cambios de estado del sidebar emitidos por el menú.
   */
  @HostListener('window:sidebar-state-changed', ['$event'])
  onSidebarStateChanged(event: Event): void {
    const customEvent = event as CustomEvent<{ collapsed?: boolean }>;
    this.isSidebarCollapsed = !!customEvent.detail?.collapsed;
  }

  /**
   * Mantiene sincronización entre pestañas del navegador.
   */
  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent): void {
    if (event.key === 'sidebarCollapsed') {
      this.syncSidebarStateFromStorage();
    }
  }
}

