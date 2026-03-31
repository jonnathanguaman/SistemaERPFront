import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RecepcionInventarioService } from '../../Service/recepcion-inventario.service';
import { RecepcionInventarioResponse, EstadoRecepcion } from '../../Entidades/recepcion-inventario.model';
import { NotificationService } from '../../../Compartido/services/notification.service';
import { AuthService } from '../../../Compartido/services/auth.service';

@Component({
  selector: 'app-recepcion-inventario',
  standalone: false,
  templateUrl: './recepcion-inventario.component.html',
  styleUrl: './recepcion-inventario.component.css'
})
export class RecepcionInventarioComponent implements OnInit {

  recepciones: RecepcionInventarioResponse[] = [];
  recepcionSeleccionada: RecepcionInventarioResponse | null = null;

  isLoading = false;
  showDetalleModal = false;
  searchTerm = '';

  constructor(
    private readonly recepcionService: RecepcionInventarioService,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.cargarRecepciones();
  }

  cargarRecepciones(): void {
    this.isLoading = true;
    this.recepcionService.findAll().subscribe({
      next: (data) => {
        this.recepciones = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error(error.message, 'Error al cargar recepciones');
      }
    });
  }

  get recepcionesFiltradas(): RecepcionInventarioResponse[] {
    if (!this.searchTerm) return this.recepciones;
    const term = this.searchTerm.toLowerCase();
    return this.recepciones.filter(r =>
      r.numeroRecepcion?.toLowerCase().includes(term) ||
      r.proveedorRazonSocial?.toLowerCase().includes(term) ||
      r.numeroFacturaProveedor?.toLowerCase().includes(term) ||
      r.numeroGuiaRemision?.toLowerCase().includes(term) ||
      r.estado?.toLowerCase().includes(term)
    );
  }

  nuevaRecepcion(): void {
    this.router.navigate(['/compras/recepciones/nueva']);
  }

  editarRecepcion(recepcion: RecepcionInventarioResponse): void {
    if (recepcion.estado !== EstadoRecepcion.PENDIENTE) {
      this.notificationService.warning('Solo se pueden editar recepciones en estado PENDIENTE', 'Operación no permitida');
      return;
    }
    this.router.navigate(['/compras/recepciones', recepcion.id, 'editar']);
  }

  verDetalle(recepcion: RecepcionInventarioResponse): void {
    this.recepcionSeleccionada = recepcion;
    this.showDetalleModal = true;
  }

  cerrarDetalleModal(): void {
    this.showDetalleModal = false;
    this.recepcionSeleccionada = null;
  }

  confirmarRecepcion(recepcion: RecepcionInventarioResponse): void {
    if (recepcion.estado !== EstadoRecepcion.PENDIENTE) {
      this.notificationService.warning('Solo se pueden confirmar recepciones en estado PENDIENTE', 'Operación no permitida');
      return;
    }
    if (!recepcion.detalles || recepcion.detalles.length === 0) {
      this.notificationService.warning(
        'La recepción no tiene productos. Haz clic en Editar para agregar los productos recibidos.',
        'Sin productos'
      );
      return;
    }
    this.notificationService.confirm(
      `¿Confirmar la recepción ${recepcion.numeroRecepcion}? Se generará el movimiento de inventario.`,
      'Confirmar recepción'
    ).then((confirmed) => {
      if (confirmed) {
        const usuarioId = this.authService.userId;
        if (!usuarioId) {
          this.notificationService.error('No se pudo obtener el usuario autenticado', 'Error');
          return;
        }
        this.recepcionService.confirmar(recepcion.id, usuarioId).subscribe({
          next: (data) => {
            this.notificationService.success(`Recepción ${data.numeroRecepcion} confirmada exitosamente`, 'Confirmada');
            this.cargarRecepciones();
          },
          error: (error) => {
            this.notificationService.error(error.message, 'Error al confirmar recepción');
          }
        });
      }
    });
  }

  cancelarRecepcion(recepcion: RecepcionInventarioResponse): void {
    if (recepcion.estado === EstadoRecepcion.CANCELADA) {
      this.notificationService.warning('La recepción ya está cancelada', 'Operación no permitida');
      return;
    }
    this.notificationService.confirmWithInput(
      '¿Estás seguro de cancelar esta recepción?',
      'Motivo de cancelación',
      'Cancelar recepción'
    ).then((result: any) => {
      if (result.isConfirmed && result.value) {
        this.recepcionService.cancelar(recepcion.id, result.value).subscribe({
          next: (data) => {
            this.notificationService.success(`Recepción ${data.numeroRecepcion} cancelada`, 'Cancelada');
            this.cargarRecepciones();
          },
          error: (error) => {
            this.notificationService.error(error.message, 'Error al cancelar recepción');
          }
        });
      }
    });
  }

  eliminarRecepcion(recepcion: RecepcionInventarioResponse): void {
    if (recepcion.estado === EstadoRecepcion.CONFIRMADA) {
      this.notificationService.warning('No se puede eliminar una recepción confirmada', 'Operación no permitida');
      return;
    }
    this.notificationService.confirm(
      `¿Eliminar la recepción ${recepcion.numeroRecepcion}?`,
      'Eliminar recepción'
    ).then((confirmed) => {
      if (confirmed) {
        this.recepcionService.delete(recepcion.id).subscribe({
          next: () => {
            this.notificationService.success(`Recepción ${recepcion.numeroRecepcion} eliminada`, 'Eliminada');
            this.cargarRecepciones();
          },
          error: (error) => {
            this.notificationService.error(error.message, 'Error al eliminar recepción');
          }
        });
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case EstadoRecepcion.PENDIENTE: return 'badge-warning';
      case EstadoRecepcion.CONFIRMADA: return 'badge-success';
      case EstadoRecepcion.CANCELADA: return 'badge-error';
      default: return 'badge-default';
    }
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return '-';
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
