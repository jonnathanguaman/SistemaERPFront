import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'ERP Sistema de Gestión';

  ngOnInit(): void {
    // Escuchar cambios en el localStorage para actualizar el margen del contenido
    window.addEventListener('storage', (event) => {
      if (event.key === 'sidebarCollapsed') {
        this.updateMainContentMargin();
      }
    });
    
    // Actualizar margen inicial
    this.updateMainContentMargin();
  }

  /**
   * Actualiza el margen del contenido principal según el estado del sidebar
   */
  private updateMainContentMargin(): void {
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

