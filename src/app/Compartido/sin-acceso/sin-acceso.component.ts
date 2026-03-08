import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sin-acceso',
  standalone: false,
  template: `
    <div class="sin-acceso-container">
      <div class="sin-acceso-card">
        <div class="icon">🚫</div>
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder a este módulo.</p>
        <p class="hint">Contacta al administrador si necesitas acceso.</p>
        <button class="btn btn-primary" (click)="volver()">Volver al inicio</button>
      </div>
    </div>
  `,
  styles: [`
    .sin-acceso-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      padding: 24px;
    }
    .sin-acceso-card {
      text-align: center;
      background: white;
      border-radius: 12px;
      padding: 48px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      max-width: 440px;
    }
    .icon { font-size: 64px; margin-bottom: 16px; }
    h1 { font-size: 24px; color: #111827; margin-bottom: 8px; }
    p { color: #6B7280; font-size: 15px; margin-bottom: 4px; }
    .hint { color: #9CA3AF; font-size: 13px; margin-bottom: 24px; }
    .btn-primary {
      background: #2563EB;
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #1D4ED8; }
  `]
})
export class SinAccesoComponent {
  constructor(private readonly router: Router) {}

  volver(): void {
    this.router.navigate(['/empleados']);
  }
}
