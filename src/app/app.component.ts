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

  constructor(private readonly authService: AuthService) {
    // Suscribirse al estado de autenticación
    this.authService.userLoginOn.subscribe(
      (isLoggedIn) => {
        this.isAuthenticated = isLoggedIn;
      }
    );
  }

  /**
   * Actualiza el margen del contenido principal según el estado del sidebar
   */
  private updateMainContentMargin(): void {
    // Solo actualizar si está autenticado
    if (!this.isAuthenticated) {
      return;
    }
    
    const isCollapsed = JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false');
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    
    if (mainContent) {
      if (window.innerWidth <= 768) {
        mainContent.style.marginLeft = isCollapsed ? '0' : '70px';
      } else {
        mainContent.style.marginLeft = isCollapsed ? '70px' : '280px';
      }
    }
  }

  /**
   * Escucha cambios en el tamaño de la ventana
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateMainContentMargin();
  }
}

