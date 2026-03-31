import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrdenCompraService } from '../../Service/orden-compra.service';
import { OrdenCompraResponse } from '../../Entidades/orden-compra.model';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { AuthService } from '../../../Compartido/services/auth.service';

@Component({
  selector: 'app-orden-compra',
  standalone: false,
  templateUrl: './orden-compra.component.html',
  styleUrl: './orden-compra.component.css'
})
export class OrdenCompraComponent implements OnInit {
  ordenes: OrdenCompraResponse[] = [];
  isLoading: boolean = false;

  searchTerm: string = '';
  selectedEstado: string = '';

  // Estados disponibles
  estados = [
    { value: '', label: 'Todos' },
    { value: 'BORRADOR', label: 'Borrador' },
    { value: 'APROBADA', label: 'Aprobada' },
    { value: 'ENVIADA', label: 'Enviada' },
    { value: 'CONFIRMADA', label: 'Confirmada' },
    { value: 'RECIBIDA', label: 'Recibida' },
    { value: 'FACTURADA', label: 'Facturada' },
    { value: 'CANCELADA', label: 'Cancelada' }
  ];
  
  constructor(
    private readonly ordenCompraService: OrdenCompraService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarOrdenes();
  }

  cargarOrdenes(): void {
    this.isLoading = true;
    
    this.ordenCompraService.findAll().subscribe({
      next: (data) => {
        this.ordenes = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al cargar órdenes');
        console.error('Error al cargar órdenes:', error);
      }
    });
  }

  nuevaOrden(): void {
    this.router.navigate(['/compras/ordenes/nueva']);
  }

  verDetalle(orden: OrdenCompraResponse): void {
    this.router.navigate(['/compras/ordenes', orden.id], { queryParams: { modo: 'ver' } });
  }

  editarOrden(orden: OrdenCompraResponse): void {
    this.router.navigate(['/compras/ordenes', orden.id]);
  }

  async eliminarOrden(orden: OrdenCompraResponse): Promise<void> {
    const confirmed = await this.notificationService.confirmDelete(orden.numeroOrden);
    
    if (!confirmed) {
      return;
    }

    this.isLoading = true;

    this.ordenCompraService.delete(orden.id).subscribe({
      next: () => {
        this.notificationService.toast('Orden de compra eliminada exitosamente', 'success');
        this.cargarOrdenes();
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al eliminar');
      }
    });
  }

  async aprobarOrden(orden: OrdenCompraResponse): Promise<void> {
    const usuarioId = this.authService.userId;
    if (!usuarioId) {
      this.notificationService.warning('No se pudo identificar el usuario autenticado. Vuelve a iniciar sesión.');
      return;
    }

    const confirmed = await this.notificationService.confirm(
      '¿Deseas aprobar esta orden de compra?',
      `Orden: ${orden.numeroOrden}`,
      'question'
    );
    
    if (!confirmed) {
      return;
    }

    this.isLoading = true;

    this.ordenCompraService.aprobar(orden.id, usuarioId).subscribe({
      next: () => {
        this.notificationService.toast('Orden aprobada exitosamente', 'success');
        this.cargarOrdenes();
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al aprobar');
      }
    });
  }

  get ordenesFiltradas(): OrdenCompraResponse[] {
    let filtered = this.ordenes;

    // Filtrar por estado
    if (this.selectedEstado) {
      filtered = filtered.filter(orden => orden.estado === this.selectedEstado);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(orden => 
        orden.numeroOrden.toLowerCase().includes(term) ||
        orden.proveedorRazonSocial?.toLowerCase().includes(term) ||
        orden.bodegaNombre?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'BORRADOR': 'badge-draft',
      'APROBADA': 'badge-success',
      'ENVIADA': 'badge-info',
      'CONFIRMADA': 'badge-primary',
      'RECIBIDA': 'badge-success',
      'FACTURADA': 'badge-success',
      'CANCELADA': 'badge-danger'
    };
    return clases[estado] || 'badge-secondary';
  }

}
